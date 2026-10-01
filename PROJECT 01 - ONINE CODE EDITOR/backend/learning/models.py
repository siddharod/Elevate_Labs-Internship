from django.db import models
from django.contrib.auth.models import User


class Lesson(models.Model):
    TRACK_CHOICES = [
        ('html', 'HTML Foundations'),
        ('css', 'Styling with CSS'),
        ('javascript', 'JavaScript Magic'),
        ('python', 'Python Adventure'),
    ]

    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    track = models.CharField(max_length=50, choices=TRACK_CHOICES)
    order = models.PositiveIntegerField(default=1)
    concept = models.CharField(max_length=255)
    explanation = models.TextField()
    starter_code = models.TextField(blank=True, default='')
    hint = models.TextField(blank=True, default='')
    solution = models.TextField(blank=True, default='')
    expected_output = models.TextField(blank=True, default='')
    xp_reward = models.PositiveIntegerField(default=25)

    class Meta:
        ordering = ['track', 'order']

    def __str__(self):
        return f"[{self.track.upper()}] {self.title}"


class UserLessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}: {'Done' if self.completed else 'In Progress'}"
