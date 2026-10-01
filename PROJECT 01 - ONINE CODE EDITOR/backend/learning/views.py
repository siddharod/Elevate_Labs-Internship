from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Lesson, UserLessonProgress
from .serializers import LessonSerializer
from accounts.views import grant_badge_if_not_earned


class LessonListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        track = request.query_params.get('track')
        lessons = Lesson.objects.all()
        if track:
            lessons = lessons.filter(track=track)
        serializer = LessonSerializer(lessons, many=True, context={'request': request})
        return Response(serializer.data)


class LessonDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        lesson = get_object_or_404(Lesson, slug=slug)
        serializer = LessonSerializer(lesson, context={'request': request})
        return Response(serializer.data)


class LessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        lesson = get_object_or_404(Lesson, slug=slug)
        progress, created = UserLessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'completed': True, 'completed_at': timezone.now()}
        )

        xp_earned = 0
        if not progress.completed or created:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()
            xp_earned = lesson.xp_reward
            if hasattr(request.user, 'profile'):
                request.user.profile.add_xp(xp_earned)

        # Check for first lesson badge
        grant_badge_if_not_earned(request.user, 'curious_coder')

        return Response({
            "message": f"Awesome job! You completed '{lesson.title}'! 🎉",
            "xp_earned": xp_earned,
            "total_xp": request.user.profile.xp if hasattr(request.user, 'profile') else 0,
            "level": request.user.profile.level if hasattr(request.user, 'profile') else 1,
        })
