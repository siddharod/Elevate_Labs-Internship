from django.contrib import admin
from .models import Project, ProjectFile, ProjectVersion, ProjectVersionFile, CodingActivity

class ProjectFileInline(admin.TabularInline):
    model = ProjectFile
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'language', 'is_public', 'created_at', 'updated_at')
    list_filter = ('language', 'is_public', 'created_at')
    search_fields = ('name', 'user__username')
    inlines = [ProjectFileInline]

@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'project', 'language', 'is_main', 'updated_at')
    search_fields = ('filename', 'project__name')

class ProjectVersionFileInline(admin.TabularInline):
    model = ProjectVersionFile
    extra = 0

@admin.register(ProjectVersion)
class ProjectVersionAdmin(admin.ModelAdmin):
    list_display = ('project', 'version_number', 'message', 'created_at', 'created_by')
    inlines = [ProjectVersionFileInline]

@admin.register(CodingActivity)
class CodingActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'created_at')
    list_filter = ('activity_type', 'created_at')
