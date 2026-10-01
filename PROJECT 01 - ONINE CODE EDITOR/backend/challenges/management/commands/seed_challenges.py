from django.core.management.base import BaseCommand
from challenges.models import Challenge


CHALLENGES = [
    # ─────────── BEGINNER ───────────
    {
        "slug": "my-first-heading",
        "title": "My First Heading",
        "difficulty": "Beginner",
        "category": "html",
        "language": "html",
        "order": 1,
        "xp_reward": 20,
        "description": "HTML headings let you create titles and section headers on a webpage. The most important heading is <h1>, going down to <h6>.",
        "instructions": "Create a webpage that has:\n• An <h1> heading that says \"Welcome to My Page\"\n• An <h2> heading that says \"About Me\"\n• An <h3> heading that says \"My Hobbies\"",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <!-- Write your headings below -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "h1", "description": "Page has an <h1> heading"},
            {"type": "has_text", "selector": "h1", "value": "Welcome to My Page", "description": "<h1> says \"Welcome to My Page\""},
            {"type": "element_exists", "selector": "h2", "description": "Page has an <h2> heading"},
            {"type": "has_text", "selector": "h2", "value": "About Me", "description": "<h2> says \"About Me\""},
            {"type": "element_exists", "selector": "h3", "description": "Page has an <h3> heading"},
        ],
    },
    {
        "slug": "paragraph-power",
        "title": "Paragraph Power",
        "difficulty": "Beginner",
        "category": "html",
        "language": "html",
        "order": 2,
        "xp_reward": 20,
        "description": "Paragraphs are the building blocks of text on any webpage. Use <p> tags to create paragraphs.",
        "instructions": "Create a webpage with:\n• An <h1> heading with any text\n• At least 2 <p> paragraphs with text inside\n• A <strong> tag used somewhere to bold important text",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Paragraphs</title>\n</head>\n<body>\n  <!-- Add your heading and paragraphs here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "h1", "description": "Page has an <h1> heading"},
            {"type": "element_count_min", "selector": "p", "value": 2, "description": "Page has at least 2 paragraphs"},
            {"type": "element_exists", "selector": "strong", "description": "Page uses <strong> for bold text"},
            {"type": "not_empty", "selector": "p", "description": "Paragraphs have actual text content"},
        ],
    },
    {
        "slug": "link-it-up",
        "title": "Link It Up!",
        "difficulty": "Beginner",
        "category": "html",
        "language": "html",
        "order": 3,
        "xp_reward": 25,
        "description": "Links (<a> tags) connect webpages. They use the href attribute to specify the destination URL.",
        "instructions": "Create a page with:\n• A heading that says \"My Favourite Websites\"\n• A link to \"https://www.google.com\" with the text \"Google\"\n• A link to \"https://www.youtube.com\" with the text \"YouTube\"\n• Both links must open in a new tab (target=\"_blank\")",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Links</title>\n</head>\n<body>\n  <!-- Add your heading and links here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "h1,h2", "description": "Page has a heading"},
            {"type": "element_exists", "selector": "a[href='https://www.google.com']", "description": "Link to Google exists"},
            {"type": "has_text", "selector": "a[href='https://www.google.com']", "value": "Google", "description": "Google link says \"Google\""},
            {"type": "element_exists", "selector": "a[href='https://www.youtube.com']", "description": "Link to YouTube exists"},
            {"type": "attribute_exists", "selector": "a[target='_blank']", "description": "Links open in a new tab (target=\"_blank\")"},
        ],
    },
    {
        "slug": "image-explorer",
        "title": "Image Explorer",
        "difficulty": "Beginner",
        "category": "html",
        "language": "html",
        "order": 4,
        "xp_reward": 25,
        "description": "Images are added with the <img> tag. They need a src (source URL) and an alt (description for accessibility).",
        "instructions": "Create a webpage with:\n• An <h1> heading that says \"My Photo Gallery\"\n• At least 2 <img> elements\n• Every image must have an alt attribute describing it\n• Images must have a width attribute set",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Photo Gallery</title>\n</head>\n<body>\n  <!-- Add your heading and images here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "has_text", "selector": "h1", "value": "My Photo Gallery", "description": "<h1> says \"My Photo Gallery\""},
            {"type": "element_count_min", "selector": "img", "value": 2, "description": "At least 2 images on the page"},
            {"type": "all_have_attribute", "selector": "img", "attribute": "alt", "description": "All images have an alt attribute"},
            {"type": "all_have_attribute", "selector": "img", "attribute": "src", "description": "All images have a src attribute"},
        ],
    },
    {
        "slug": "list-master",
        "title": "List Master",
        "difficulty": "Beginner",
        "category": "html",
        "language": "html",
        "order": 5,
        "xp_reward": 25,
        "description": "HTML has two types of lists: unordered (<ul>) with bullets, and ordered (<ol>) with numbers. Both use <li> for items.",
        "instructions": "Create a page with:\n• An <h1> heading that says \"My Lists\"\n• An unordered list (<ul>) with at least 3 items about your favourite foods\n• An ordered list (<ol>) with at least 3 steps to make a sandwich",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Lists</title>\n</head>\n<body>\n  <!-- Create your lists here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "has_text", "selector": "h1", "value": "My Lists", "description": "<h1> says \"My Lists\""},
            {"type": "element_exists", "selector": "ul", "description": "Page has an unordered list (<ul>)"},
            {"type": "element_count_min", "selector": "ul li", "value": 3, "description": "Unordered list has at least 3 items"},
            {"type": "element_exists", "selector": "ol", "description": "Page has an ordered list (<ol>)"},
            {"type": "element_count_min", "selector": "ol li", "value": 3, "description": "Ordered list has at least 3 items"},
        ],
    },

    # ─────────── EASY ───────────
    {
        "slug": "build-a-table",
        "title": "Build a Table",
        "difficulty": "Easy",
        "category": "html",
        "language": "html",
        "order": 6,
        "xp_reward": 40,
        "description": "HTML tables organize data in rows and columns using <table>, <tr> (row), <th> (header), and <td> (cell) tags.",
        "instructions": "Create a table showing student grades:\n• Must have a <table> element\n• Must have a header row using <th> tags with: Name, Subject, Grade\n• Must have at least 3 data rows (<tr>) with <td> cells\n• Add a border attribute or style to make it visible",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Student Grades</title>\n  <style>\n    table { border-collapse: collapse; width: 100%; }\n    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }\n    th { background-color: #f2f2f2; }\n  </style>\n</head>\n<body>\n  <h1>Student Grades</h1>\n  <!-- Build your table here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "table", "description": "Page has a <table> element"},
            {"type": "element_exists", "selector": "th", "description": "Table has header cells (<th>)"},
            {"type": "element_count_min", "selector": "th", "value": 3, "description": "Table has at least 3 header columns"},
            {"type": "element_count_min", "selector": "tbody tr, table tr", "value": 4, "description": "Table has at least 3 data rows (plus header)"},
            {"type": "element_exists", "selector": "td", "description": "Table has data cells (<td>)"},
        ],
    },
    {
        "slug": "contact-form",
        "title": "Contact Form",
        "difficulty": "Easy",
        "category": "forms",
        "language": "html",
        "order": 7,
        "xp_reward": 40,
        "description": "Forms collect input from users. They use <form>, <input>, <label>, and <button> elements.",
        "instructions": "Create a contact form with:\n• A <form> element\n• A Name field: <label> + <input type=\"text\">\n• An Email field: <label> + <input type=\"email\">\n• A Message field: <label> + <textarea>\n• A Submit <button> with the text \"Send Message\"",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Contact Me</title>\n  <style>\n    body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; }\n    label { display: block; margin-top: 15px; font-weight: bold; }\n    input, textarea { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px; }\n    button { margin-top: 20px; padding: 10px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }\n  </style>\n</head>\n<body>\n  <h1>Contact Me</h1>\n  <!-- Build your form here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "form", "description": "Page has a <form> element"},
            {"type": "element_exists", "selector": "input[type='text'], input:not([type])", "description": "Form has a text input (Name field)"},
            {"type": "element_exists", "selector": "input[type='email']", "description": "Form has an email input"},
            {"type": "element_exists", "selector": "textarea", "description": "Form has a textarea (Message field)"},
            {"type": "element_exists", "selector": "label", "description": "Form has labels for accessibility"},
            {"type": "element_exists", "selector": "button, input[type='submit']", "description": "Form has a submit button"},
        ],
    },
    {
        "slug": "color-my-text",
        "title": "Color My Text",
        "difficulty": "Easy",
        "category": "css",
        "language": "html",
        "order": 8,
        "xp_reward": 35,
        "description": "CSS lets you change text colors, sizes, and fonts. Use the color property for text color and font-size for text size.",
        "instructions": "Style a page using CSS:\n• Give <h1> a color (any color except black)\n• Set body font-family to any sans-serif font\n• Create a class called .highlight and give it a background-color\n• Apply .highlight to at least one element\n• Make the <h1> font-size at least 32px",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Colorful Page</title>\n  <style>\n    /* Write your CSS here */\n\n  </style>\n</head>\n<body>\n  <h1>My Colorful Page</h1>\n  <p>This is a normal paragraph.</p>\n  <p>This paragraph will be highlighted!</p>\n</body>\n</html>",
        "validation_rules": [
            {"type": "css_rule_exists", "selector": "h1", "property": "color", "description": "<h1> has a color style applied"},
            {"type": "css_rule_exists", "selector": "body", "property": "font-family", "description": "body has a font-family set"},
            {"type": "class_exists_in_dom", "selector": ".highlight", "description": "A .highlight class is applied to an element"},
            {"type": "css_rule_exists", "selector": ".highlight", "property": "background-color", "description": ".highlight has a background-color"},
        ],
    },
    {
        "slug": "the-box-model",
        "title": "The Box Model",
        "difficulty": "Easy",
        "category": "css",
        "language": "html",
        "order": 9,
        "xp_reward": 40,
        "description": "Every HTML element is a box. CSS lets you control padding (inside space), margin (outside space), and border.",
        "instructions": "Create a styled box:\n• Create a div with class \"box\"\n• Give .box: padding of at least 20px\n• Give .box: a visible border (any style)\n• Give .box: a border-radius to round corners\n• Give .box: a background-color different from white\n• Put some text inside the box",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Box Model</title>\n  <style>\n    body {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      background: #f0f0f0;\n    }\n    /* Style your .box here */\n\n  </style>\n</head>\n<body>\n  <div class=\"box\">\n    <!-- Add your content here -->\n  </div>\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".box", "description": "A .box element exists"},
            {"type": "computed_style_check", "selector": ".box", "property": "padding", "check": "not_zero", "description": ".box has padding applied"},
            {"type": "computed_style_check", "selector": ".box", "property": "border-width", "check": "not_zero", "description": ".box has a visible border"},
            {"type": "computed_style_check", "selector": ".box", "property": "border-radius", "check": "not_zero", "description": ".box has rounded corners (border-radius)"},
            {"type": "computed_style_check", "selector": ".box", "property": "background-color", "check": "not_default", "description": ".box has a background-color"},
            {"type": "not_empty", "selector": ".box", "description": ".box has content inside"},
        ],
    },
    {
        "slug": "navigation-bar",
        "title": "Navigation Bar",
        "difficulty": "Easy",
        "category": "css",
        "language": "html",
        "order": 10,
        "xp_reward": 45,
        "description": "Navigation bars help users move between pages. They typically use <nav>, <ul>, <li>, and <a> elements styled with CSS.",
        "instructions": "Build a styled navbar:\n• Use a <nav> element\n• Inside nav, have a <ul> with at least 3 <li> items\n• Each <li> must contain an <a> link\n• Style the nav with a background-color\n• Make list items display horizontally (display: inline or flex)\n• Remove the default bullet points from the list",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Navigation Bar</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: Arial, sans-serif; }\n    /* Style your navbar here */\n\n  </style>\n</head>\n<body>\n  <!-- Build your nav here -->\n\n  <main style=\"padding: 40px;\">\n    <h1>Welcome to My Site</h1>\n    <p>This is the main content area.</p>\n  </main>\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "nav", "description": "Page has a <nav> element"},
            {"type": "element_exists", "selector": "nav ul", "description": "Nav contains an unordered list"},
            {"type": "element_count_min", "selector": "nav li", "value": 3, "description": "Nav has at least 3 menu items"},
            {"type": "element_exists", "selector": "nav a", "description": "Nav items contain links"},
            {"type": "computed_style_check", "selector": "nav", "property": "background-color", "check": "not_default", "description": "Nav has a background-color"},
        ],
    },

    # ─────────── INTERMEDIATE ───────────
    {
        "slug": "profile-card",
        "title": "Profile Card",
        "difficulty": "Intermediate",
        "category": "cards",
        "language": "html",
        "order": 11,
        "xp_reward": 60,
        "description": "Profile cards display information about a person in an attractive, self-contained component. Common in social media and team pages.",
        "instructions": "Build a profile card component:\n• Create a div with class \"profile-card\"\n• Add an <img> for a profile photo (can be any image URL)\n• Add an <h2> for the person's name\n• Add a <p> for their role/title\n• .profile-card must have a visible border or box-shadow\n• .profile-card must have rounded corners (border-radius)\n• .profile-card must have padding",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Profile Card</title>\n  <style>\n    body {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      font-family: Arial, sans-serif;\n    }\n    /* Style your .profile-card here */\n\n  </style>\n</head>\n<body>\n  <!-- Build your profile card here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".profile-card", "description": "A .profile-card element exists"},
            {"type": "element_exists", "selector": ".profile-card img", "description": "Profile card has an image"},
            {"type": "element_exists", "selector": ".profile-card h2, .profile-card h1", "description": "Profile card has a name heading"},
            {"type": "element_exists", "selector": ".profile-card p", "description": "Profile card has a description paragraph"},
            {"type": "computed_style_check", "selector": ".profile-card", "property": "border-radius", "check": "not_zero", "description": ".profile-card has rounded corners"},
            {"type": "computed_style_check", "selector": ".profile-card", "property": "padding", "check": "not_zero", "description": ".profile-card has padding"},
        ],
    },
    {
        "slug": "flexbox-layout",
        "title": "Flexbox Layout",
        "difficulty": "Intermediate",
        "category": "layout",
        "language": "html",
        "order": 12,
        "xp_reward": 60,
        "description": "Flexbox is a powerful CSS layout system that makes it easy to align and distribute elements. It's the foundation of modern web layouts.",
        "instructions": "Create a flexbox layout:\n• Create a div with class \"flex-container\"\n• Inside it, add at least 3 divs with class \"flex-item\"\n• Apply display: flex to .flex-container\n• Add gap between items\n• Each .flex-item must have a background-color, padding, and some text\n• Center the items horizontally using justify-content",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Flexbox Layout</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      padding: 40px;\n      background: #f0f4f8;\n    }\n    /* Style .flex-container and .flex-item here */\n\n  </style>\n</head>\n<body>\n  <h1>Flexbox Cards</h1>\n  <!-- Build your flex layout here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".flex-container", "description": "A .flex-container element exists"},
            {"type": "computed_style_check", "selector": ".flex-container", "property": "display", "check": "equals", "value": "flex", "description": ".flex-container uses display: flex"},
            {"type": "element_count_min", "selector": ".flex-item", "value": 3, "description": "At least 3 .flex-item elements exist"},
            {"type": "computed_style_check", "selector": ".flex-item", "property": "padding", "check": "not_zero", "description": "Flex items have padding"},
            {"type": "computed_style_check", "selector": ".flex-item", "property": "background-color", "check": "not_default", "description": "Flex items have background-colors"},
        ],
    },
    {
        "slug": "product-card",
        "title": "Product Card",
        "difficulty": "Intermediate",
        "category": "cards",
        "language": "html",
        "order": 13,
        "xp_reward": 65,
        "description": "Product cards are used in e-commerce to display items for sale. They typically show an image, name, price, and a buy button.",
        "instructions": "Build a product card for an online store:\n• Create a div with class \"product-card\"\n• Add a product image (<img>)\n• Add a product name in an <h3>\n• Add a price in an element with class \"price\" (format: $XX.XX)\n• Add a button with class \"btn-buy\" and text \"Add to Cart\"\n• Style the card with a shadow (box-shadow) and rounded corners\n• .btn-buy must have a background-color and color",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Product Card</title>\n  <style>\n    body {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      background: #f8fafc;\n      font-family: Arial, sans-serif;\n    }\n    /* Style your product card here */\n\n  </style>\n</head>\n<body>\n  <!-- Build your product card here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".product-card", "description": "A .product-card element exists"},
            {"type": "element_exists", "selector": ".product-card img", "description": "Product card has an image"},
            {"type": "element_exists", "selector": ".product-card h3, .product-card h2", "description": "Product card has a name heading"},
            {"type": "element_exists", "selector": ".price", "description": "Product card has a .price element"},
            {"type": "element_exists", "selector": ".btn-buy", "description": "Product card has an Add to Cart button (.btn-buy)"},
            {"type": "computed_style_check", "selector": ".product-card", "property": "border-radius", "check": "not_zero", "description": ".product-card has rounded corners"},
            {"type": "computed_style_check", "selector": ".btn-buy", "property": "background-color", "check": "not_default", "description": ".btn-buy has a background color"},
        ],
    },
    {
        "slug": "two-column-layout",
        "title": "Two-Column Layout",
        "difficulty": "Intermediate",
        "category": "layout",
        "language": "html",
        "order": 14,
        "xp_reward": 60,
        "description": "Multi-column layouts are essential for modern web design. CSS Grid makes this easy with its powerful grid system.",
        "instructions": "Create a two-column layout using CSS Grid:\n• Create a div with class \"grid-wrapper\"\n• Apply display: grid to .grid-wrapper\n• Set up 2 columns (e.g. grid-template-columns: 1fr 1fr)\n• Add a \"sidebar\" div and a \"content\" div inside\n• Add a gap between the columns\n• Each column must have padding and background-color",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Grid Layout</title>\n  <style>\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body {\n      font-family: Arial, sans-serif;\n      padding: 20px;\n      background: #f0f0f0;\n      min-height: 100vh;\n    }\n    /* Style .grid-wrapper, .sidebar, .content here */\n\n  </style>\n</head>\n<body>\n  <h1 style=\"margin-bottom: 20px;\">Two Column Layout</h1>\n  <!-- Build your grid layout here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".grid-wrapper", "description": "A .grid-wrapper element exists"},
            {"type": "computed_style_check", "selector": ".grid-wrapper", "property": "display", "check": "equals", "value": "grid", "description": ".grid-wrapper uses display: grid"},
            {"type": "element_exists", "selector": ".sidebar", "description": "Page has a .sidebar element"},
            {"type": "element_exists", "selector": ".content", "description": "Page has a .content element"},
            {"type": "computed_style_check", "selector": ".sidebar", "property": "padding", "check": "not_zero", "description": "Sidebar has padding"},
            {"type": "computed_style_check", "selector": ".content", "property": "padding", "check": "not_zero", "description": "Content area has padding"},
        ],
    },
    {
        "slug": "registration-form",
        "title": "Registration Form",
        "difficulty": "Intermediate",
        "category": "forms",
        "language": "html",
        "order": 15,
        "xp_reward": 65,
        "description": "Registration forms collect user information to create accounts. They require proper input types, validation attributes, and accessibility.",
        "instructions": "Create a full registration form:\n• A <form> with id=\"register-form\"\n• Username field: <input type=\"text\" name=\"username\" required>\n• Email field: <input type=\"email\" name=\"email\" required>\n• Password field: <input type=\"password\" name=\"password\">\n• Gender: a <select> dropdown with at least 3 <option> items\n• A checkbox <input type=\"checkbox\"> for agreeing to terms\n• A submit button\n• All inputs must have corresponding <label> tags",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Register</title>\n  <style>\n    body { font-family: Arial, sans-serif; max-width: 480px; margin: 40px auto; padding: 24px; background: #f8fafc; }\n    .form-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }\n    label { display: block; margin-top: 16px; font-weight: 600; color: #333; }\n    input, select { width: 100%; padding: 10px; margin-top: 6px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }\n    .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 16px; }\n    .checkbox-row input { width: auto; }\n    button { margin-top: 24px; width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }\n  </style>\n</head>\n<body>\n  <div class=\"form-card\">\n    <h1>Create Account</h1>\n    <!-- Build your registration form here -->\n\n  </div>\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": "form#register-form, form", "description": "Page has a <form> element"},
            {"type": "element_exists", "selector": "input[type='text'][name='username'], input[name='username']", "description": "Form has a username input"},
            {"type": "element_exists", "selector": "input[type='email']", "description": "Form has an email input"},
            {"type": "element_exists", "selector": "input[type='password']", "description": "Form has a password input"},
            {"type": "element_exists", "selector": "select", "description": "Form has a dropdown (<select>)"},
            {"type": "element_count_min", "selector": "select option", "value": 3, "description": "Dropdown has at least 3 options"},
            {"type": "element_exists", "selector": "input[type='checkbox']", "description": "Form has a checkbox for terms"},
            {"type": "element_exists", "selector": "label", "description": "Form has labels for fields"},
        ],
    },
    {
        "slug": "hero-section",
        "title": "Hero Section",
        "difficulty": "Intermediate",
        "category": "layout",
        "language": "html",
        "order": 16,
        "xp_reward": 70,
        "description": "A hero section is the large, attention-grabbing banner at the top of a website. It usually has a bold heading, subtext, and a call-to-action button.",
        "instructions": "Build a full-width hero section:\n• Create a <section> with class \"hero\"\n• .hero must have a background-color or background-image\n• Add an <h1> with a bold title (min 40px font-size)\n• Add a <p> with subtitle text\n• Add a button or link with class \"cta-btn\"\n• Center all content vertically and horizontally (use flexbox)\n• .hero must be at least 400px tall",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Hero Section</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { font-family: 'Arial', sans-serif; }\n    /* Style your hero section here */\n\n  </style>\n</head>\n<body>\n  <!-- Build your hero section here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".hero", "description": "A .hero section element exists"},
            {"type": "element_exists", "selector": ".hero h1", "description": "Hero has an <h1> heading"},
            {"type": "element_exists", "selector": ".hero p", "description": "Hero has a subtitle paragraph"},
            {"type": "element_exists", "selector": ".cta-btn", "description": "Hero has a call-to-action button (.cta-btn)"},
            {"type": "computed_style_check", "selector": ".hero", "property": "display", "check": "equals", "value": "flex", "description": ".hero uses flexbox for centering"},
            {"type": "computed_style_check", "selector": ".cta-btn", "property": "background-color", "check": "not_default", "description": "CTA button has a background color"},
        ],
    },
    {
        "slug": "responsive-card-grid",
        "title": "Responsive Card Grid",
        "difficulty": "Intermediate",
        "category": "layout",
        "language": "html",
        "order": 17,
        "xp_reward": 75,
        "description": "A responsive card grid adjusts the number of columns based on screen width. CSS Grid's auto-fill and minmax make this easy.",
        "instructions": "Build a responsive card grid:\n• Create a div with class \"card-grid\"\n• Use display: grid and grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))\n• Add at least 4 divs with class \"card\" inside\n• Each .card must have: padding, background, border-radius, and a box-shadow\n• Each card must have an <h3> and a <p>",
        "starter_code": "<!DOCTYPE html>\n<html>\n<head>\n  <title>Card Grid</title>\n  <style>\n    * { box-sizing: border-box; }\n    body {\n      font-family: Arial, sans-serif;\n      padding: 32px;\n      background: #f8fafc;\n    }\n    /* Style .card-grid and .card here */\n\n  </style>\n</head>\n<body>\n  <h1>Feature Cards</h1>\n  <!-- Build your card grid here -->\n\n</body>\n</html>",
        "validation_rules": [
            {"type": "element_exists", "selector": ".card-grid", "description": "A .card-grid container exists"},
            {"type": "computed_style_check", "selector": ".card-grid", "property": "display", "check": "equals", "value": "grid", "description": ".card-grid uses display: grid"},
            {"type": "element_count_min", "selector": ".card", "value": 4, "description": "At least 4 .card elements exist"},
            {"type": "element_exists", "selector": ".card h3, .card h2", "description": "Cards have headings"},
            {"type": "element_exists", "selector": ".card p", "description": "Cards have paragraphs"},
            {"type": "computed_style_check", "selector": ".card", "property": "border-radius", "check": "not_zero", "description": "Cards have rounded corners"},
            {"type": "computed_style_check", "selector": ".card", "property": "padding", "check": "not_zero", "description": "Cards have padding"},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with HTML/CSS beginner challenges'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing challenges before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Challenge.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} existing challenges.'))

        created_count = 0
        updated_count = 0

        for data in CHALLENGES:
            challenge, created = Challenge.objects.update_or_create(
                slug=data['slug'],
                defaults={
                    'title': data['title'],
                    'difficulty': data['difficulty'],
                    'category': data['category'],
                    'language': data['language'],
                    'order': data['order'],
                    'xp_reward': data['xp_reward'],
                    'description': data['description'],
                    'instructions': data['instructions'],
                    'starter_code': data['starter_code'],
                    'validation_rules': data['validation_rules'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  [+] Created: {challenge.title}'))
            else:
                updated_count += 1
                self.stdout.write(f'  ~ Updated: {challenge.title}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {created_count}, Updated {updated_count} challenges.'
            )
        )
