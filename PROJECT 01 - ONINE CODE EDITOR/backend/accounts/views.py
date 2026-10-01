from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile, Badge, UserBadge
from .serializers import RegisterSerializer, UserSerializer, UserBadgeSerializer


def grant_badge_if_not_earned(user, badge_code):
    try:
        badge = Badge.objects.get(code=badge_code)
        user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)
        if created and hasattr(user, 'profile'):
            user.profile.add_xp(badge.xp_reward)
        return created
    except Badge.DoesNotExist:
        return False


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Grant first welcome badge
            grant_badge_if_not_earned(user, 'welcome')

            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Welcome to CodeBuddy! Your coding journey begins now! 🚀",
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username_or_email or not password:
            return Response(
                {"error": "Please provide both username/email and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If it looks like an email, resolve it to a username first
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                username_to_auth = user_obj.username
            except User.DoesNotExist:
                return Response(
                    {"error": "No account found with that email address."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            username_to_auth = username_or_email

        user = authenticate(username=username_to_auth, password=password)
        if not user:
            return Response(
                {"error": "Invalid username or password. Check spelling and try again!"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": f"Welcome back, {user.username}! 🎉",
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        avatar = request.data.get('avatar')
        bio = request.data.get('bio')
        display_name = request.data.get('display_name')

        if avatar:
            profile.avatar = avatar
        if bio is not None:
            profile.bio = bio
        if display_name:
            profile.display_name = display_name
        profile.save()

        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"message": "Successfully logged out. See you next time! 👋"})


class UserBadgesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        serializer = UserBadgeSerializer(user_badges, many=True)
        all_badges = Badge.objects.all()
        earned_ids = {ub.badge_id for ub in user_badges}

        badges_list = []
        for b in all_badges:
            badges_list.append({
                "id": b.id,
                "code": b.code,
                "name": b.name,
                "description": b.description,
                "icon": b.icon,
                "xp_reward": b.xp_reward,
                "earned": b.id in earned_ids,
            })

        return Response({
            "badges": badges_list,
            "total_earned": len(earned_ids),
            "total_available": all_badges.count(),
        })
