from rest_framework import serializers
from .models import Lesson, UserLessonProgress


class LessonSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'slug', 'title', 'track', 'order', 'concept',
            'explanation', 'starter_code', 'hint', 'solution',
            'expected_output', 'xp_reward', 'completed'
        ]

    def get_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserLessonProgress.objects.filter(user=request.user, lesson=obj, completed=True).exists()
        return False
