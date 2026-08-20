import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class Gallery(models.Model):
    class CategoryChoices(models.TextChoices):
        DARSHAN = 'darshan', _('Live Darshan')
        RITUALS = 'rituals', _('Pooja & Rituals')
        DECORATIONS = 'decorations', _('Temple Decoration')
        EVENTS = 'events', _('Mahotsav Events')
        GENERAL = 'general', _('General')

    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', _('Active')
        DRAFT = 'draft', _('Draft')
        ARCHIVED = 'archived', _('Archived')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_("ID"))
    title = models.CharField(max_length=200, verbose_name=_("Title"))
    category = models.CharField(
        max_length=50,
        choices=CategoryChoices.choices,
        default=CategoryChoices.DARSHAN,
        verbose_name=_("Category")
    )
    image = models.ImageField(upload_to='gallery/', verbose_name=_("Image"))
    caption = models.TextField(blank=True, verbose_name=_("Caption / Description"))
    is_featured = models.BooleanField(default=False, verbose_name=_("Is Featured"))
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Gallery Item")
        verbose_name_plural = _("Gallery Items")
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class AartiBooking(models.Model):
    class AartiTypeChoices(models.TextChoices):
        MORNING = 'morning', _('Morning Aarti (9:00 AM)')
        NIGHT = 'night', _('Night Aarti (8:00 PM)')
        MANGALA = 'mangala', _('Mangala Aarti (6:00 AM)')
        RAJBHOG = 'rajbhog', _('Rajbhog Aarti (12:00 PM)')
        SANDHYA = 'sandhya', _('Sandhya Aarti (7:00 PM)')
        SHEJ = 'shej', _('Shej Aarti (9:30 PM)')

    class StatusChoices(models.TextChoices):
        CONFIRMED = 'confirmed', _('Confirmed')
        PENDING = 'pending', _('Pending')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')
        REJECTED = 'rejected', _('Rejected')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_("ID"))
    devotee_name = models.CharField(max_length=150, verbose_name=_("Devotee Name"))
    email = models.EmailField(verbose_name=_("Email Address"))
    phone = models.CharField(max_length=20, verbose_name=_("Phone Number"))
    city = models.CharField(max_length=100, blank=True, default='', verbose_name=_("City"))
    aarti_type = models.CharField(
        max_length=30,
        choices=AartiTypeChoices.choices,
        default=AartiTypeChoices.MORNING,
        verbose_name=_("Aarti Type")
    )
    booking_date = models.DateField(verbose_name=_("Booking Date"))
    number_of_devotees = models.PositiveIntegerField(default=1, verbose_name=_("Number of Devotees"))
    id_proof_image = models.ImageField(
        upload_to='aarti_bookings/id_proofs/',
        blank=True,
        null=True,
        verbose_name=_("ID Proof Image")
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.CONFIRMED,
        verbose_name=_("Status")
    )
    notes = models.TextField(blank=True, verbose_name=_("Special Notes"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Aarti Booking")
        verbose_name_plural = _("Aarti Bookings")
        ordering = ['-booking_date', '-created_at']

    @property
    def booking_id(self):
        if not self.booking_date:
            date_str = '20260914'
        elif hasattr(self.booking_date, 'strftime'):
            date_str = self.booking_date.strftime('%Y%m%d')
        else:
            date_str = str(self.booking_date).replace('-', '')[:8]
        short_id = str(self.id).replace('-', '')[:6].upper()
        return f"AB-{date_str}-{short_id}"

    def __str__(self):
        return f"{self.devotee_name} ({self.booking_id}) - {self.get_aarti_type_display()} on {self.booking_date}"


class Donation(models.Model):
    class PaymentMethodChoices(models.TextChoices):
        UPI = 'upi', _('UPI / QR Code')
        CARD = 'card', _('Credit/Debit Card')
        NETBANKING = 'netbanking', _('Net Banking')
        CASH = 'cash', _('Cash Offering')

    class StatusChoices(models.TextChoices):
        PENDING = 'pending', _('Pending Verification')
        VERIFIED = 'verified', _('Verified & Processed')
        REJECTED = 'rejected', _('Rejected')
        REFUNDED = 'refunded', _('Refunded')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_("ID"))
    donor_name = models.CharField(max_length=150, verbose_name=_("Donor Name"))
    email = models.EmailField(verbose_name=_("Email Address"))
    phone = models.CharField(max_length=20, verbose_name=_("Phone Number"))
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_("Amount (INR)"))
    currency = models.CharField(max_length=10, default='INR', verbose_name=_("Currency"))
    transaction_id = models.CharField(max_length=100, unique=True, verbose_name=_("Transaction ID"))
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethodChoices.choices,
        default=PaymentMethodChoices.UPI,
        verbose_name=_("Payment Method")
    )
    receipt_image = models.ImageField(
        upload_to='donations/receipts/',
        blank=True,
        null=True,
        verbose_name=_("Receipt Screenshot")
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Donation")
        verbose_name_plural = _("Donations")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.donor_name} - ₹{self.amount} ({self.transaction_id})"


class Membership(models.Model):
    class MembershipTierChoices(models.TextChoices):
        SILVER = 'silver', _('Silver Bhakta')
        GOLD = 'gold', _('Gold Bhakta')
        PLATINUM = 'platinum', _('Platinum Trustee')
        LIFE_PATRON = 'life', _('Life Patron')

    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', _('Active')
        APPROVED = 'approved', _('Approved')
        PENDING = 'pending', _('Pending Approval')
        EXPIRED = 'expired', _('Expired')
        REJECTED = 'rejected', _('Rejected')
        SUSPENDED = 'suspended', _('Suspended')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_("ID"))
    full_name = models.CharField(max_length=150, verbose_name=_("Full Name"))
    email = models.EmailField(verbose_name=_("Email Address"))
    phone = models.CharField(max_length=20, verbose_name=_("Phone Number"))
    city = models.CharField(max_length=100, blank=True, default='', verbose_name=_("City"))
    address = models.TextField(blank=True, default='', verbose_name=_("Residential Address"))
    occupation = models.CharField(max_length=100, blank=True, default='', verbose_name=_("Occupation"))
    volunteer = models.CharField(
        max_length=100,
        blank=True,
        default='Aarti & Ritual Assistance',
        verbose_name=_("Volunteer Interest")
    )
    membership_tier = models.CharField(
        max_length=30,
        choices=MembershipTierChoices.choices,
        default=MembershipTierChoices.SILVER,
        verbose_name=_("Membership Tier")
    )
    photo = models.ImageField(
        upload_to='memberships/photos/',
        blank=True,
        null=True,
        verbose_name=_("Member Photo")
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Membership")
        verbose_name_plural = _("Memberships")
        ordering = ['-created_at']

    @property
    def membership_id(self):
        short_id = str(self.id).replace('-', '')[:6].upper()
        return f"GMN-2026-{short_id}"

    def __str__(self):
        return f"{self.full_name} ({self.membership_id}) - {self.city or 'Surat'}"


class Contact(models.Model):
    class StatusChoices(models.TextChoices):
        NEW = 'new', _('New Inquiry')
        IN_PROGRESS = 'in_progress', _('In Progress')
        RESOLVED = 'resolved', _('Resolved')
        CLOSED = 'closed', _('Closed')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name=_("ID"))
    name = models.CharField(max_length=150, verbose_name=_("Name"))
    email = models.EmailField(verbose_name=_("Email Address"))
    phone = models.CharField(max_length=20, blank=True, verbose_name=_("Phone Number"))
    subject = models.CharField(max_length=200, verbose_name=_("Subject"))
    message = models.TextField(verbose_name=_("Message"))
    attachment = models.ImageField(
        upload_to='contact/attachments/',
        blank=True,
        null=True,
        verbose_name=_("Attachment Image")
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.NEW,
        verbose_name=_("Status")
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Contact Inquiry")
        verbose_name_plural = _("Contact Inquiries")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"
