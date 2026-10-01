from django.contrib import admin
from .models import Lesson, UserLessonProgress

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'track', 'order', 'xp_reward')
    list_filter = ('track',)
    search_fields = ('title', 'concept')

@admin.register(UserLessonProgress)
class UserLessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed', 'completed_at')
    list_filter = ('completed', 'completed_at')
