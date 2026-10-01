# Seed script for initial badges, lessons, and challenges
from django.core.management.base import BaseCommand
from accounts.models import Badge
from learning.models import Lesson
from challenges.models import Challenge


class Command(BaseCommand):
    help = "Seed CodeBuddy with default badges, learning lessons, and coding challenges"

    def handle(self, *args, **options):
        self.stdout.write("Seeding CodeBuddy data...")

        # 1. Badges
        badges_data = [
            {'code': 'welcome', 'name': 'First Step', 'description': 'Joined the CodeBuddy universe!', 'icon': '🚀', 'xp_reward': 50},
            {'code': 'first_project', 'name': 'World Creator', 'description': 'Created your very first project!', 'icon': '🧩', 'xp_reward': 50},
            {'code': 'first_save', 'name': 'Safety First', 'description': 'Saved your project to history!', 'icon': '💾', 'xp_reward': 50},
            {'code': 'code_runner', 'name': 'Engine Ignited', 'description': 'Ran your program for the first time!', 'icon': '⚡', 'xp_reward': 50},
            {'code': 'first_share', 'name': 'Friend of Code', 'description': 'Shared a project snapshot with friends!', 'icon': '🔗', 'xp_reward': 75},
            {'code': 'curious_coder', 'name': 'Explorer', 'description': 'Completed your first learning lesson!', 'icon': '📖', 'xp_reward': 50},
            {'code': 'challenge_champion', 'name': 'Puzzle Master', 'description': 'Passed an automated coding challenge!', 'icon': '🏆', 'xp_reward': 100},
            {'code': 'project_builder', 'name': 'Architect', 'description': 'Built 5 creative coding projects!', 'icon': '⭐', 'xp_reward': 150},
        ]
        for b in badges_data:
            Badge.objects.update_or_create(code=b['code'], defaults=b)
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(badges_data)} badges."))

        # 2. Lessons
        lessons_data = [
            {
                'slug': 'html-tags-and-headings',
                'title': 'Tags & Headings',
                'track': 'html',
                'order': 1,
                'concept': 'HTML tags are like containers that tell the browser what type of content is inside.',
                'explanation': 'Headings in HTML go from <h1> (biggest) to <h6> (smallest). Like chapters in an exciting storybook!',
                'starter_code': '<h1>Welcome to My Secret Base!</h1>\n<h2>Commander: Byte</h2>\n<p>Enter your secret password below...</p>',
                'hint': 'Try changing the heading text or adding a <h3> subtitle!',
                'solution': '<h1>Welcome to My Secret Base!</h1>\n<h2>Commander: Byte</h2>\n<h3>Mission: Learn to Code</h3>',
                'expected_output': 'Welcome to My Secret Base!',
                'xp_reward': 30
            },
            {
                'slug': 'html-buttons-and-magic',
                'title': 'Clickable Magic Buttons',
                'track': 'html',
                'order': 2,
                'concept': 'Buttons allow people using your website to interact with your code!',
                'explanation': 'A button is written using the <button> tag. Anything between <button> and </button> is the label shown to users.',
                'starter_code': '<button>Click Me!</button>\n<button>Teleport to Mars 🚀</button>',
                'hint': 'Create a new button that says "Launch Rocket 🚀"!',
                'solution': '<button>Launch Rocket 🚀</button>',
                'expected_output': 'Click Me!',
                'xp_reward': 35
            },
            {
                'slug': 'css-vibrant-colors',
                'title': 'Colors & Backgrounds',
                'track': 'css',
                'order': 1,
                'concept': 'CSS gives your web page style, vibrant colors, and life!',
                'explanation': 'You can change background-color and text color using friendly hex codes like #5BC0EB (Sky Blue) or #FFD166 (Yellow).',
                'starter_code': 'body {\n  background-color: #5BC0EB;\n  color: #182033;\n  font-family: sans-serif;\n  text-align: center;\n}',
                'hint': 'Try changing the background-color to #FF7EB6 for a bubblegum pink vibe!',
                'solution': 'body {\n  background-color: #FF7EB6;\n  color: #ffffff;\n}',
                'expected_output': 'background-color',
                'xp_reward': 30
            },
            {
                'slug': 'css-rounded-cards',
                'title': 'Bouncy Rounded Cards',
                'track': 'css',
                'order': 2,
                'concept': 'Border-radius softens sharp corners into playful, friendly rounded shapes.',
                'explanation': 'Setting border-radius: 20px turns a regular rectangle into a modern, rounded card that looks great!',
                'starter_code': '.card {\n  background: white;\n  border-radius: 24px;\n  padding: 20px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n}',
                'hint': 'Try border-radius: 9999px for pill-shaped buttons!',
                'solution': '.card { border-radius: 24px; }',
                'expected_output': 'border-radius',
                'xp_reward': 35
            },
            {
                'slug': 'js-what-is-a-variable',
                'title': 'What is a Variable?',
                'track': 'javascript',
                'order': 1,
                'concept': 'A variable is like a labeled storage box where your program can remember information.',
                'explanation': 'We create a box using `let` or `const`. For example: let playerName = "Byte"; stores the name Byte!',
                'starter_code': '// Create a variable for your coding mascot\nlet mascot = "Byte";\nlet energy = 100;\n\nconsole.log(mascot + " has " + energy + " energy points! ⚡");',
                'hint': 'Try changing energy to 200 and run again!',
                'solution': 'let mascot = "Byte"; let energy = 200;',
                'expected_output': 'energy points',
                'xp_reward': 30
            },
            {
                'slug': 'js-functions-recipes',
                'title': 'Functions: The Recipe of Code',
                'track': 'javascript',
                'order': 2,
                'concept': 'A function is a reusable recipe that performs an action whenever you call it.',
                'explanation': 'Instead of repeating code, write a function once and call it whenever you need to bake the cake!',
                'starter_code': 'function makeCheer(name) {\n  return "🎉 Go " + name + ", you got this! 🚀";\n}\n\nconsole.log(makeCheer("Coder"));\nconsole.log(makeCheer("Byte"));',
                'hint': 'Call makeCheer with your own name!',
                'solution': 'console.log(makeCheer("Superstar"));',
                'expected_output': '🎉 Go',
                'xp_reward': 35
            },
            {
                'slug': 'py-adventure-begins',
                'title': 'Python Adventure & Loops',
                'track': 'python',
                'order': 1,
                'concept': 'Python uses clean indentation to group code together and is super readable!',
                'explanation': 'A for loop lets you repeat code a specific number of times without retyping it.',
                'starter_code': '# Repeating a magic spell 3 times:\nfor spell_count in range(1, 4):\n    print(f"✨ Casting Sparkle Wave #{spell_count}!")\n\nprint("Spell successfully cast! 🌟")',
                'hint': 'Change range(1, 4) to range(1, 6) to cast 5 spells!',
                'solution': 'for i in range(1, 6): print(i)',
                'expected_output': 'Casting Sparkle Wave',
                'xp_reward': 35
            }
        ]
        for l in lessons_data:
            Lesson.objects.update_or_create(slug=l['slug'], defaults=l)
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(lessons_data)} lessons."))

        # 3. Challenges
        challenges_data = [
            {
                'slug': 'super-adder',
                'title': 'Super Number Adder ➕',
                'difficulty': 'Easy',
                'language': 'python',
                'order': 1,
                'description': 'Help Byte add two numbers together from the computer inputs!',
                'instructions': 'Read two numbers line by line from input and print their sum as an integer.',
                'starter_code': '# Read two numbers and print their sum\nnum1 = int(input())\nnum2 = int(input())\n\n# Your code here:\nprint(num1 + num2)\n',
                'test_cases': [
                    {'input': '5\n10', 'expected': '15', 'description': 'Adds 5 and 10'},
                    {'input': '12\n8', 'expected': '20', 'description': 'Adds 12 and 8'},
                    {'input': '100\n250', 'expected': '350', 'description': 'Adds 100 and 250'}
                ],
                'xp_reward': 50
            },
            {
                'slug': 'reverse-word-robot',
                'title': 'Secret Word Reverser 🔄',
                'difficulty': 'Easy',
                'language': 'python',
                'order': 2,
                'description': 'Byte intercepted an alien message! You need to reverse it to decode the secret phrase.',
                'instructions': 'Read a word from input and print it backwards.',
                'starter_code': '# Read string and print it backwards\nword = input().strip()\n\n# Hint: in Python, word[::-1] reverses a string!\nprint(word[::-1])\n',
                'test_cases': [
                    {'input': 'hello', 'expected': 'olleh', 'description': 'Reverses hello'},
                    {'input': 'byte', 'expected': 'etyb', 'description': 'Reverses byte'},
                    {'input': 'codebuddy', 'expected': 'yddubedoc', 'description': 'Reverses codebuddy'}
                ],
                'xp_reward': 60
            },
            {
                'slug': 'celsius-to-fahrenheit',
                'title': 'Temperature Converter 🌡️',
                'difficulty': 'Medium',
                'language': 'python',
                'order': 3,
                'description': 'Convert temperature in Celsius into Fahrenheit for robot weather stations.',
                'instructions': 'Read Celsius temperature (float or int) and print Fahrenheit rounded to 1 decimal place. Formula: (C * 9/5) + 32.',
                'starter_code': 'celsius = float(input())\nfahrenheit = (celsius * 9 / 5) + 32\nprint(f"{fahrenheit:.1f}")\n',
                'test_cases': [
                    {'input': '0', 'expected': '32.0', 'description': 'Freezing point of water'},
                    {'input': '100', 'expected': '212.0', 'description': 'Boiling point of water'},
                    {'input': '25', 'expected': '77.0', 'description': 'Comfortable room temperature'}
                ],
                'xp_reward': 75
            }
        ]
        for c in challenges_data:
            Challenge.objects.update_or_create(slug=c['slug'], defaults=c)
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(challenges_data)} challenges."))
        self.stdout.write(self.style.SUCCESS("[OK] All seed data successfully loaded!"))
