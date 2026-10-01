from django.contrib import admin
from .models import Challenge, ChallengeProgress, ChallengeAttempt


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'category', 'language', 'xp_reward', 'order')
    list_filter = ('difficulty', 'category', 'language')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ChallengeProgress)
class ChallengeProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'passed', 'best_score', 'total_requirements', 'passed_at')
    list_filter = ('passed',)
    search_fields = ('user__username', 'challenge__title')


@admin.register(ChallengeAttempt)
class ChallengeAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'passed', 'score', 'total', 'created_at')
    list_filter = ('passed', 'created_at')
    search_fields = ('user__username', 'challenge__title')
