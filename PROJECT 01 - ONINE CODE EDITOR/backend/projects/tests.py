from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Project, ProjectFile, ProjectVersion
from accounts.models import Badge


class CodeBuddyAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Badge.objects.create(code='welcome', name='First Step', description='Welcome', xp_reward=50)
        Badge.objects.create(code='first_project', name='World Creator', description='First Project', xp_reward=50)
        Badge.objects.create(code='first_save', name='Safety First', description='Saved', xp_reward=50)
        Badge.objects.create(code='first_share', name='Friend of Code', description='Shared', xp_reward=75)

        # Register a test child user
        response = self.client.post('/api/auth/register/', {
            'username': 'timmy',
            'email': 'timmy@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_and_manage_project(self):
        # 1. Create project
        resp = self.client.post('/api/projects/', {
            'name': 'My Rocket Page',
            'language': 'html'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        proj_id = resp.data['id']
        self.assertEqual(len(resp.data['files']), 3)  # index.html, style.css, script.js

        # 2. Add a new file
        resp_file = self.client.post(f'/api/projects/{proj_id}/files/', {
            'filename': 'about.html',
            'language': 'html',
            'content': '<h1>About Rocket</h1>'
        }, format='json')
        self.assertEqual(resp_file.status_code, status.HTTP_201_CREATED)

        # 3. Save project with version snapshot
        main_file = ProjectFile.objects.filter(project_id=proj_id, filename='index.html').first()
        save_resp = self.client.post(f'/api/projects/{proj_id}/save/', {
            'files': [
                {'id': main_file.id, 'content': '<h1>Updated Rocket Page 🚀</h1>', 'filename': 'index.html'}
            ],
            'create_version': True,
            'version_message': 'Added rocket emoji'
        }, format='json')
        self.assertEqual(save_resp.status_code, status.HTTP_200_OK)

        # 4. Check versions
        hist_resp = self.client.get(f'/api/projects/{proj_id}/history/')
        self.assertEqual(hist_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(hist_resp.data), 2)

        # 5. Restore version 1
        restore_resp = self.client.post(f'/api/projects/{proj_id}/restore/1/')
        self.assertEqual(restore_resp.status_code, status.HTTP_200_OK)

        # 6. Share project
        share_resp = self.client.post(f'/api/share/project/{proj_id}/')
        self.assertEqual(share_resp.status_code, status.HTTP_201_CREATED)
        share_id = share_resp.data['share_id']

        # Public anonymous access to shared project
        anon_client = APIClient()
        pub_resp = anon_client.get(f'/api/share/{share_id}/')
        self.assertEqual(pub_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(pub_resp.data['snapshot_name'], 'My Rocket Page')

    def test_python_code_execution(self):
        resp = self.client.post('/api/execute/', {
            'language': 'python',
            'code': 'print("Hello Byte!")\n',
            'stdin': ''
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'success')
        self.assertIn('Hello Byte!', resp.data['stdout'])
