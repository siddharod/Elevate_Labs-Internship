from django.db import models
from django.contrib.auth.models import User


class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner 🌱'),
        ('Easy', 'Easy ⭐'),
        ('Intermediate', 'Intermediate ⭐⭐'),
    ]

    CATEGORY_CHOICES = [
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('layout', 'Layout'),
        ('forms', 'Forms'),
        ('cards', 'Cards'),
    ]

    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='html')
    language = models.CharField(max_length=50, default='html')
    description = models.TextField()
    instructions = models.TextField()
    starter_code = models.TextField()
    # validation_rules: list of {type, selector, property, value, description}
    # type can be: "element_exists", "has_text", "has_attribute", "css_property", "child_count", "class_exists"
    validation_rules = models.JSONField(default=list)
    xp_reward = models.PositiveIntegerField(default=50)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'difficulty']

    def __str__(self):
        return f"{self.title} ({self.difficulty})"


class ChallengeProgress(models.Model):
    """Tracks the best attempt per user per challenge."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenge_progress')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='progress_records')
    passed = models.BooleanField(default=False)
    best_score = models.IntegerField(default=0)   # passed_requirements count
    total_requirements = models.IntegerField(default=0)
    last_code = models.TextField(blank=True, default='')
    passed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'challenge')
        ordering = ['-updated_at']

    def __str__(self):
        status = 'Passed' if self.passed else 'In Progress'
        return f"{self.user.username} — {self.challenge.title}: {status}"


class ChallengeAttempt(models.Model):
    """Individual submission record (kept for history)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenge_attempts')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='attempts')
    submitted_code = models.TextField()
    passed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    feedback = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}: {'Passed' if self.passed else 'Failed'}"
