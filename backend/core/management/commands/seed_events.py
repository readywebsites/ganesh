from django.core.management.base import BaseCommand
from core.models import Event


INITIAL_EVENTS = [
    {
        'order': 1,
        'day': 'Day 01 | Bhadrapada Chaturthi',
        'title': 'Pran Pratishtha (Divine Invocation)',
        'description': 'Welcome the Lord with traditional Dhol Tasha drums. The placement of the idol is accompanied by rigorous Vedic chants to invoke the soul of Ganesha into the clay Murti.',
        'time': '08:30 AM - 11:30 AM',
        'location': 'Main Temple Hall',
        'is_active': True,
    },
    {
        'order': 2,
        'day': 'Day 05 | Bhadrapada Ashtami',
        'title': 'Maha Chhappan Bhog Offering',
        'description': 'A glorious visual offering of 56 varieties of handcrafted Modaks, traditional sweets, and sacred fruits. Prepared by master chefs and devotees with utmost purity.',
        'time': '12:30 PM onwards',
        'location': 'Prasad Mandap',
        'is_active': True,
    },
    {
        'order': 3,
        'day': 'Day 08 | Bhadrapada Ekadashi',
        'title': 'Divine Maha Aarti & Jagran',
        'description': 'A spectacular evening filled with hundreds of brass lamps, ringing bells, and classical performance. Singing devotional bhajans that run late into the night.',
        'time': '07:00 PM - 11:00 PM',
        'location': 'Sanctuary Courtyard',
        'is_active': True,
    },
    {
        'order': 4,
        'day': 'Day 10 | Anant Chaturdashi',
        'title': 'Visarjan (Divine Immersion)',
        'description': 'The emotional send-off procession under saffron colors. Immersing the eco-friendly clay idol in water, symbolizing the cycle of form returning to formlessness.',
        'time': '09:00 AM onwards',
        'location': 'Sacred Water Ghats',
        'is_active': True,
    },
]


class Command(BaseCommand):
    help = 'Seeds the 4 initial celebration schedule events into the database if not present'

    def handle(self, *args, **options):
        for data in INITIAL_EVENTS:
            event, created = Event.objects.get_or_create(
                title=data['title'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Event #{event.order}: {event.title}"))
            else:
                # Ensure order and details match
                for key, val in data.items():
                    setattr(event, key, val)
                event.save()
                self.stdout.write(self.style.WARNING(f"Updated Event #{event.order}: {event.title}"))
        self.stdout.write(self.style.SUCCESS("Successfully seeded/verified all 4 celebration schedule events."))
