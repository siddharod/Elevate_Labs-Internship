from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Challenge, ChallengeProgress, ChallengeAttempt
from .serializers import ChallengeSerializer, ChallengeProgressSerializer
from projects.models import CodingActivity
from accounts.views import grant_badge_if_not_earned


class ChallengeListView(APIView):
    """Return all challenges. Includes user progress if authenticated."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        challenges = Challenge.objects.all()
        serializer = ChallengeSerializer(challenges, many=True, context={'request': request})
        return Response(serializer.data)


class ChallengeDetailView(APIView):
    """Return a single challenge by slug."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        challenge = get_object_or_404(Challenge, slug=slug)
        serializer = ChallengeSerializer(challenge, context={'request': request})
        return Response(serializer.data)


class ChallengeSubmitView(APIView):
    """
    Record a browser-validated submission result.

    The frontend performs DOM-based validation entirely in the browser.
    It sends the result (passed/failed requirements) along with the code
    to this endpoint, which records progress and awards XP.

    No server-side code execution happens here.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        challenge = get_object_or_404(Challenge, slug=slug)
        submitted_code = request.data.get('code', '').strip()
        passed_count = int(request.data.get('passed_count', 0))
        total_count = int(request.data.get('total_count', len(challenge.validation_rules)))
        all_passed = request.data.get('all_passed', False)

        if not submitted_code:
            return Response(
                {"error": "Please provide code to submit!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Record individual attempt
        attempt = ChallengeAttempt.objects.create(
            user=request.user,
            challenge=challenge,
            submitted_code=submitted_code,
            passed=all_passed,
            score=passed_count,
            total=total_count,
            feedback=(
                f"All {total_count} requirements passed! Amazing work! 🌟"
                if all_passed
                else f"{passed_count}/{total_count} requirements completed. Keep going!"
            )
        )

        # Update or create progress record (keep best)
        progress, created = ChallengeProgress.objects.get_or_create(
            user=request.user,
            challenge=challenge,
            defaults={
                'passed': all_passed,
                'best_score': passed_count,
                'total_requirements': total_count,
                'last_code': submitted_code,
                'passed_at': timezone.now() if all_passed else None,
            }
        )

        if not created:
            progress.last_code = submitted_code
            progress.total_requirements = total_count
            # Only update if this attempt is better
            if passed_count > progress.best_score:
                progress.best_score = passed_count
            if all_passed and not progress.passed:
                progress.passed = True
                progress.passed_at = timezone.now()
            progress.save()

        # Award XP on first-time pass
        xp_awarded = 0
        if all_passed:
            # Only award XP once (on first pass)
            first_pass = created or (not created and not progress.passed)
            # Check if this is the actual first time they passed
            pass_count = ChallengeAttempt.objects.filter(
                user=request.user,
                challenge=challenge,
                passed=True
            ).count()
            if pass_count == 1:  # This was the first pass
                if hasattr(request.user, 'profile'):
                    request.user.profile.add_xp(challenge.xp_reward)
                xp_awarded = challenge.xp_reward
                CodingActivity.objects.create(
                    user=request.user,
                    activity_type='challenge_passed',
                    description=f"Completed challenge: {challenge.title}",
                    metadata={"xp": xp_awarded, "challenge_slug": challenge.slug}
                )
                grant_badge_if_not_earned(request.user, 'challenge_champion')

        return Response({
            "passed": all_passed,
            "passed_count": passed_count,
            "total_count": total_count,
            "xp_awarded": xp_awarded,
            "feedback": attempt.feedback,
            "user_xp": getattr(getattr(request.user, 'profile', None), 'xp', 0),
            "user_level": getattr(getattr(request.user, 'profile', None), 'level', 1),
        })


class UserChallengeProgressView(APIView):
    """Return all challenge progress for the authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        progress = ChallengeProgress.objects.filter(user=request.user).select_related('challenge')
        serializer = ChallengeProgressSerializer(progress, many=True)
        return Response(serializer.data)
