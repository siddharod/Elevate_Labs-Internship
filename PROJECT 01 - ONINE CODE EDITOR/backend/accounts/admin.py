from django.contrib import admin
from .models import UserProfile, Badge, UserBadge

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'xp', 'level', 'streak_days', 'created_at')
    search_fields = ('user__username', 'display_name')

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'icon', 'xp_reward')

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'earned_at')
    list_filter = ('badge', 'earned_at')
