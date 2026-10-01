from rest_framework import serializers
from .models import Challenge, ChallengeProgress, ChallengeAttempt


class ChallengeSerializer(serializers.ModelSerializer):
    user_passed = serializers.SerializerMethodField()
    user_best_score = serializers.SerializerMethodField()
    total_requirements = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id', 'slug', 'title', 'difficulty', 'category', 'language',
            'description', 'instructions', 'starter_code',
            'validation_rules', 'xp_reward', 'order',
            'user_passed', 'user_best_score', 'total_requirements',
        ]

    def get_user_passed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.progress_records.filter(user=request.user).first()
            return progress.passed if progress else False
        return False

    def get_user_best_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.progress_records.filter(user=request.user).first()
            return progress.best_score if progress else 0
        return 0

    def get_total_requirements(self, obj):
        return len(obj.validation_rules)


class ChallengeProgressSerializer(serializers.ModelSerializer):
    challenge_slug = serializers.CharField(source='challenge.slug', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)

    class Meta:
        model = ChallengeProgress
        fields = [
            'id', 'challenge_slug', 'challenge_title',
            'passed', 'best_score', 'total_requirements', 'passed_at', 'updated_at'
        ]
        read_only_fields = fields


class ChallengeAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeAttempt
        fields = ['id', 'challenge', 'submitted_code', 'passed', 'score', 'total', 'feedback', 'created_at']
        read_only_fields = fields
