from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
import cloudinary.uploader
from apps.accounts.models import Profile
from apps.menu.models import Category, MenuItem, Modifier
from apps.tables.models import Table

User = get_user_model()

CATEGORIES = [
    {
        "name": "Appetizers",
        "slug": "appetizers",
        "description": "Start your meal right",
        "order": 1,
    },
    {
        "name": "Burgers",
        "slug": "burgers",
        "description": "Handcrafted burgers",
        "order": 2,
    },
    {
        "name": "Pasta",
        "slug": "pasta",
        "description": "Authentic Italian pasta",
        "order": 3,
    },
    {
        "name": "Seafood",
        "slug": "seafood",
        "description": "Fresh catches daily",
        "order": 4,
    },
    {
        "name": "Salads",
        "slug": "salads",
        "description": "Fresh and healthy",
        "order": 5,
    },
    {
        "name": "Sides",
        "slug": "sides",
        "description": "Perfect accompaniments",
        "order": 6,
    },
    {
        "name": "Desserts",
        "slug": "desserts",
        "description": "Sweet endings",
        "order": 7,
    },
    {
        "name": "Beverages",
        "slug": "beverages",
        "description": "Drinks & refreshments",
        "order": 8,
    },
]

FOOD_IMAGES = {
    "crispy-calamari": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
    "bruschetta": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400",
    "spinach-artichoke-dip": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400",
    "classic-cheeseburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    "bbq-bacon-burger": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400",
    "mushroom-swiss-burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
    "spaghetti-carbonara": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
    "fettuccine-alfredo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400",
    "penne-arrabbiata": "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400",
    "grilled-salmon": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    "fish-and-chips": "https://images.unsplash.com/photo-1579203149875-a78a0e72a35c?w=400",
    "garlic-shrimp": "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400",
    "caesar-salad": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400",
    "greek-salad": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    "truffle-fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    "onion-rings": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
    "sweet-potato-fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    "tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    "chocolate-lava-cake": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    "cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400",
    "craft-lemonade": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400",
    "iced-tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    "espresso": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400",
}

MENU_ITEMS = [
    {
        "name": "Crispy Calamari",
        "slug": "crispy-calamari",
        "category_slug": "appetizers",
        "description": "Lightly battered calamari with marinara sauce",
        "price": 12.99,
        "is_featured": False,
        "prep_time_minutes": 10,
    },
    {
        "name": "Bruschetta",
        "slug": "bruschetta",
        "category_slug": "appetizers",
        "description": "Toasted bread topped with fresh tomatoes, basil, and mozzarella",
        "price": 9.99,
        "is_featured": False,
        "prep_time_minutes": 8,
    },
    {
        "name": "Spinach Artichoke Dip",
        "slug": "spinach-artichoke-dip",
        "category_slug": "appetizers",
        "description": "Creamy dip served with tortilla chips",
        "price": 11.49,
        "is_featured": True,
        "prep_time_minutes": 12,
    },
    {
        "name": "Classic Cheeseburger",
        "slug": "classic-cheeseburger",
        "category_slug": "burgers",
        "description": "Angus beef patty with cheddar, lettuce, tomato, and our secret sauce",
        "price": 15.99,
        "is_featured": True,
        "prep_time_minutes": 15,
    },
    {
        "name": "BBQ Bacon Burger",
        "slug": "bbq-bacon-burger",
        "category_slug": "burgers",
        "description": "Topped with crispy bacon, onion rings, and smoky BBQ sauce",
        "price": 17.99,
        "is_featured": False,
        "prep_time_minutes": 18,
    },
    {
        "name": "Mushroom Swiss Burger",
        "slug": "mushroom-swiss-burger",
        "category_slug": "burgers",
        "description": "Sautéed mushrooms and melted Swiss on a toasted brioche bun",
        "price": 16.49,
        "is_featured": False,
        "prep_time_minutes": 18,
    },
    {
        "name": "Spaghetti Carbonara",
        "slug": "spaghetti-carbonara",
        "category_slug": "pasta",
        "description": "Classic Roman pasta with egg, pecorino, and pancetta",
        "price": 18.99,
        "is_featured": True,
        "prep_time_minutes": 20,
    },
    {
        "name": "Fettuccine Alfredo",
        "slug": "fettuccine-alfredo",
        "category_slug": "pasta",
        "description": "Creamy parmesan sauce over fettuccine",
        "price": 16.99,
        "is_featured": False,
        "prep_time_minutes": 15,
    },
    {
        "name": "Penne Arrabbiata",
        "slug": "penne-arrabbiata",
        "category_slug": "pasta",
        "description": "Spicy tomato sauce with garlic and fresh basil",
        "price": 15.49,
        "is_featured": False,
        "prep_time_minutes": 15,
    },
    {
        "name": "Grilled Salmon",
        "slug": "grilled-salmon",
        "category_slug": "seafood",
        "description": "Atlantic salmon with lemon butter sauce and seasonal vegetables",
        "price": 24.99,
        "is_featured": True,
        "prep_time_minutes": 22,
    },
    {
        "name": "Fish & Chips",
        "slug": "fish-and-chips",
        "category_slug": "seafood",
        "description": "Beer-battered cod with tartar sauce and fries",
        "price": 18.99,
        "is_featured": False,
        "prep_time_minutes": 18,
    },
    {
        "name": "Garlic Shrimp",
        "slug": "garlic-shrimp",
        "category_slug": "seafood",
        "description": "Sautéed shrimp in garlic butter sauce",
        "price": 20.99,
        "is_featured": False,
        "prep_time_minutes": 14,
    },
    {
        "name": "Caesar Salad",
        "slug": "caesar-salad",
        "category_slug": "salads",
        "description": "Romaine lettuce, parmesan, croutons, and house-made Caesar dressing",
        "price": 12.99,
        "is_featured": False,
        "prep_time_minutes": 8,
    },
    {
        "name": "Greek Salad",
        "slug": "greek-salad",
        "category_slug": "salads",
        "description": "Tomatoes, cucumbers, olives, feta, and red onion with vinaigrette",
        "price": 13.49,
        "is_featured": False,
        "prep_time_minutes": 8,
    },
    {
        "name": "Truffle Fries",
        "slug": "truffle-fries",
        "category_slug": "sides",
        "description": "Hand-cut fries tossed in truffle oil with parmesan",
        "price": 7.99,
        "is_featured": True,
        "prep_time_minutes": 10,
    },
    {
        "name": "Onion Rings",
        "slug": "onion-rings",
        "category_slug": "sides",
        "description": "Beer-battered and fried golden",
        "price": 6.99,
        "is_featured": False,
        "prep_time_minutes": 8,
    },
    {
        "name": "Sweet Potato Fries",
        "slug": "sweet-potato-fries",
        "category_slug": "sides",
        "description": "Crispy sweet potato fries with chipotle aioli",
        "price": 7.49,
        "is_featured": False,
        "prep_time_minutes": 10,
    },
    {
        "name": "Tiramisu",
        "slug": "tiramisu",
        "category_slug": "desserts",
        "description": "Classic Italian coffee-flavored layered dessert",
        "price": 9.99,
        "is_featured": True,
        "prep_time_minutes": 5,
    },
    {
        "name": "Chocolate Lava Cake",
        "slug": "chocolate-lava-cake",
        "category_slug": "desserts",
        "description": "Warm chocolate cake with molten center and vanilla ice cream",
        "price": 10.99,
        "is_featured": False,
        "prep_time_minutes": 12,
    },
    {
        "name": "Cheesecake",
        "slug": "cheesecake",
        "category_slug": "desserts",
        "description": "New York style with berry compote",
        "price": 8.99,
        "is_featured": False,
        "prep_time_minutes": 3,
    },
    {
        "name": "Craft Lemonade",
        "slug": "craft-lemonade",
        "category_slug": "beverages",
        "description": "Fresh-squeezed lemonade with your choice of flavor",
        "price": 4.99,
        "is_featured": False,
        "prep_time_minutes": 3,
    },
    {
        "name": "Iced Tea",
        "slug": "iced-tea",
        "category_slug": "beverages",
        "description": "House-brewed sweet or unsweetened",
        "price": 3.49,
        "is_featured": False,
        "prep_time_minutes": 2,
    },
    {
        "name": "Espresso",
        "slug": "espresso",
        "category_slug": "beverages",
        "description": "Double shot of our house blend",
        "price": 3.99,
        "is_featured": False,
        "prep_time_minutes": 3,
    },
]

MODIFIERS = [
    {
        "name": "Extra Cheese",
        "price": 2.00,
        "max_selections": 2,
        "item_slugs": [
            "classic-cheeseburger",
            "bbq-bacon-burger",
            "mushroom-swiss-burger",
        ],
    },
    {
        "name": "Gluten-Free Bun",
        "price": 3.00,
        "max_selections": 1,
        "item_slugs": [
            "classic-cheeseburger",
            "bbq-bacon-burger",
            "mushroom-swiss-burger",
        ],
    },
    {
        "name": "Side Salad",
        "price": 4.00,
        "max_selections": 1,
        "item_slugs": ["grilled-salmon", "fish-and-chips", "garlic-shrimp"],
    },
    {
        "name": "Double Portion",
        "price": 6.00,
        "max_selections": 1,
        "item_slugs": ["truffle-fries", "onion-rings", "sweet-potato-fries"],
    },
]

TABLES = [
    {"number": 1, "capacity": 2, "location": "indoor"},
    {"number": 2, "capacity": 2, "location": "indoor"},
    {"number": 3, "capacity": 4, "location": "indoor"},
    {"number": 4, "capacity": 4, "location": "indoor"},
    {"number": 5, "capacity": 6, "location": "indoor"},
    {"number": 6, "capacity": 8, "location": "indoor"},
    {"number": 7, "capacity": 2, "location": "patio"},
    {"number": 8, "capacity": 4, "location": "patio"},
    {"number": 9, "capacity": 4, "location": "patio"},
    {"number": 10, "capacity": 6, "location": "patio"},
]


class Command(BaseCommand):
    help = "Seed the database with initial data"

    def handle(self, *args, **options):
        self._seed_users()
        self._seed_categories()
        self._seed_menu_items()
        self._seed_modifiers()
        self._seed_tables()
        self.stdout.write(self.style.SUCCESS("Database seeded successfully"))

    def _seed_users(self):
        admin, created = User.objects.get_or_create(
            email="admin@resta.com",
            defaults={"role": "admin", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            Profile.objects.get_or_create(
                user=admin, defaults={"first_name": "Admin", "last_name": "User"}
            )
            self.stdout.write(f"  Created admin user: admin@resta.com / admin123")

        staff, created = User.objects.get_or_create(
            email="staff@resta.com",
            defaults={"role": "staff", "is_staff": True},
        )
        if created:
            staff.set_password("staff123")
            staff.save()
            Profile.objects.get_or_create(
                user=staff, defaults={"first_name": "Staff", "last_name": "User"}
            )
            self.stdout.write(f"  Created staff user: staff@resta.com / staff123")

    def _seed_categories(self):
        for cat in CATEGORIES:
            obj, created = Category.objects.get_or_create(
                slug=cat["slug"],
                defaults={
                    "name": cat["name"],
                    "description": cat["description"],
                    "order": cat["order"],
                },
            )
            if created:
                self.stdout.write(f"  Created category: {obj.name}")

    def _seed_menu_items(self):
        for item in MENU_ITEMS:
            category = Category.objects.get(slug=item["category_slug"])
            image_url = FOOD_IMAGES.get(item["slug"])
            defaults = {
                "name": item["name"],
                "category": category,
                "description": item["description"],
                "price": item["price"],
                "is_featured": item["is_featured"],
                "prep_time_minutes": item["prep_time_minutes"],
            }
            if image_url:
                defaults["image"] = image_url
            obj, created = MenuItem.objects.get_or_create(
                slug=item["slug"],
                defaults=defaults,
            )
            changed = False
            if not created:
                for field, val in [
                    ("name", item["name"]),
                    ("category", category),
                    ("description", item["description"]),
                    ("price", item["price"]),
                    ("is_featured", item["is_featured"]),
                    ("prep_time_minutes", item["prep_time_minutes"]),
                ]:
                    if getattr(obj, field) != val:
                        setattr(obj, field, val)
                        changed = True
                if image_url and not obj.image:
                    obj.image = image_url
                    changed = True
                if changed:
                    obj.save()
            if created or changed:
                self.stdout.write(
                    f"  {'Created' if created else 'Updated'} menu item: {obj.name}"
                )

    def _upload_image(self, obj, image_url):
        try:
            result = cloudinary.uploader.upload(
                image_url, folder="resta/menu/", public_id=obj.slug
            )
            obj.image = result["public_id"]
            obj.save()
            self.stdout.write(f"  Uploaded image for: {obj.name}")
        except CloudinaryError as e:
            self.stdout.write(
                self.style.WARNING(f"  Cloudinary upload failed for {obj.name}: {e}")
            )

    def _seed_modifiers(self):
        for mod in MODIFIERS:
            obj, created = Modifier.objects.update_or_create(
                name=mod["name"],
                defaults={
                    "price": mod["price"],
                    "max_selections": mod["max_selections"],
                },
            )
            if created:
                items = MenuItem.objects.filter(slug__in=mod["item_slugs"])
                obj.menu_items.set(items)
                self.stdout.write(f"  Created modifier: {obj.name}")

    def _seed_tables(self):
        for t in TABLES:
            obj, created = Table.objects.get_or_create(
                number=t["number"],
                defaults={
                    "capacity": t["capacity"],
                    "location": t["location"],
                },
            )
            if created:
                self.stdout.write(f"  Created table: {obj.number}")
