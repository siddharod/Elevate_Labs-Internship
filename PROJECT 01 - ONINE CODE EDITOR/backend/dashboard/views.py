from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from projects.models import Project, CodingActivity
from projects.serializers import ProjectSerializer, CodingActivitySerializer
from challenges.models import ChallengeAttempt
from accounts.serializers import UserBadgeSerializer


class DashboardOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        user_projects = Project.objects.filter(user=user)
        projects_count = user_projects.count()
        recent_projects = user_projects.order_by('-updated_at')[:6]

        distinct_languages = user_projects.values_list('language', flat=True).distinct().count()

        activities = CodingActivity.objects.filter(user=user)
        sessions_count = activities.count()
        recent_activities = activities.order_by('-created_at')[:8]

        completed_challenges_count = ChallengeAttempt.objects.filter(
            user=user, passed=True
        ).values('challenge').distinct().count()

        user_badges = user.badges.select_related('badge')[:6]

        display_name = profile.display_name if profile and profile.display_name else user.username.capitalize()

        return Response({
            "user": {
                "username": user.username,
                "display_name": display_name,
                "avatar": profile.avatar if profile else "robot-1",
                "xp": profile.xp if profile else 0,
                "level": profile.level if profile else 1,
                "streak_days": profile.streak_days if profile else 1,
            },
            "stats": {
                "projects_count": projects_count,
                "coding_sessions": max(1, sessions_count),
                "challenges_completed": completed_challenges_count,
                "languages_count": max(1, distinct_languages),
            },
            "recent_projects": ProjectSerializer(recent_projects, many=True).data,
            "recent_activities": CodingActivitySerializer(recent_activities, many=True).data,
            "earned_badges": UserBadgeSerializer(user_badges, many=True).data,
        })
