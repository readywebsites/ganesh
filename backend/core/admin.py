from django.contrib import admin
from django.utils.html import format_html

from .models import Gallery, AartiBooking, Donation, Membership, Contact, Event


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = (
        'image_preview',
        'title',
        'category',
        'status',
        'is_featured',
        'created_at',
        'updated_at',
    )
    list_filter = ('status', 'category', 'is_featured', 'created_at')
    search_fields = ('title', 'caption', 'category')
    ordering = ('-created_at',)
    list_editable = ('status', 'is_featured')
    readonly_fields = (
        'id',
        'image_preview_large',
        'created_at',
        'updated_at',
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />',
                obj.image.url,
            )
        return "No Image"

    image_preview.short_description = "Preview"

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:300px;border-radius:8px;border:1px solid #ddd;" />',
                obj.image.url,
            )
        return "No Image"

    image_preview_large.short_description = "Full Preview"


@admin.register(AartiBooking)
class AartiBookingAdmin(admin.ModelAdmin):
    list_display = ('id_proof_preview', 'devotee_name', 'email', 'phone', 'aarti_type', 'booking_date', 'number_of_devotees', 'status', 'created_at')
    list_filter = ('status', 'aarti_type', 'booking_date', 'created_at')
    search_fields = ('devotee_name', 'email', 'phone', 'notes')
    ordering = ('-booking_date', '-created_at')
    list_editable = ('status',)
    readonly_fields = ('id', 'id_proof_preview_large', 'created_at', 'updated_at')

    def id_proof_preview(self, obj):
        if obj.id_proof_image:
            return format_html(
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />',
                obj.id_proof_image.url,
            )
        return "No ID Proof"

    id_proof_preview.short_description = "ID Proof"

    def id_proof_preview_large(self, obj):
        if obj.id_proof_image:
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:300px;border-radius:8px;border:1px solid #ddd;" />',
                obj.id_proof_image.url,
            )
        return "No ID Proof"

    id_proof_preview_large.short_description = "ID Proof Preview"


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        'receipt_preview',
        'donor_name',
        'email',
        'phone',
        'amount',
        'currency',
        'transaction_id',
        'payment_method',
        'status',
        'created_at',
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('donor_name', 'email', 'phone', 'transaction_id')
    ordering = ('-created_at',)
    list_editable = ('status',)
    readonly_fields = (
        'id',
        'receipt_preview_large',
        'created_at',
        'updated_at',
    )

    def receipt_preview(self, obj):
        if obj.receipt_image:
            return format_html(
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />',
                obj.receipt_image.url,
            )
        return "No Receipt"

    receipt_preview.short_description = "Receipt"

    def receipt_preview_large(self, obj):
        if obj.receipt_image:
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:300px;border-radius:8px;border:1px solid #ddd;" />',
                obj.receipt_image.url,
            )
        return "No Receipt"

    receipt_preview_large.short_description = "Receipt Preview"


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = (
        'photo_preview',
        'full_name',
        'phone',
        'email',
        'city',
        'volunteer',
        'membership_tier',
        'status',
        'created_at',
    )
    list_filter = ('status', 'membership_tier', 'volunteer', 'city', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'city', 'occupation', 'volunteer', 'address')
    ordering = ('-created_at',)
    list_editable = ('status', 'membership_tier')
    readonly_fields = (
        'id',
        'membership_id_display',
        'photo_preview_large',
        'created_at',
        'updated_at',
    )

    def membership_id_display(self, obj):
        return obj.membership_id

    membership_id_display.short_description = "Membership ID"

    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:45px;height:45px;object-fit:cover;border-radius:50%;border:2px solid #f39c12;" />',
                obj.photo.url,
            )
        return "No Photo"

    photo_preview.short_description = "Photo"

    def photo_preview_large(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-width:250px;max-height:250px;border-radius:12px;border:2px solid #f39c12;" />',
                obj.photo.url,
            )
        return "No Photo"

    photo_preview_large.short_description = "Photo Preview"


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        'attachment_preview',
        'name',
        'email',
        'phone',
        'subject',
        'status',
        'created_at',
    )
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'phone', 'subject', 'message')
    ordering = ('-created_at',)
    list_editable = ('status',)
    readonly_fields = (
        'id',
        'attachment_preview_large',
        'created_at',
        'updated_at',
    )

    def attachment_preview(self, obj):
        if obj.attachment:
            return format_html(
                '<img src="{}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #ddd;" />',
                obj.attachment.url,
            )
        return "No Attachment"

    attachment_preview.short_description = "Attachment"

    def attachment_preview_large(self, obj):
        if obj.attachment:
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:300px;border-radius:8px;border:1px solid #ddd;" />',
                obj.attachment.url,
            )
        return "No Attachment"

    attachment_preview_large.short_description = "Attachment Preview"


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        'title',
        'date_display',
        'timing_display',
        'category',
        'location',
        'is_active',
        'status',
        'created_at',
    )
    list_filter = ('is_active', 'category', 'status', 'created_at')
    search_fields = ('title', 'description', 'day', 'location', 'category')
    ordering = ('order', 'created_at')
    list_editable = ('order', 'is_active')
    list_display_links = ('title',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Schedule Event Information', {
            'fields': ('title', 'category', 'description')
        }),
        ('Date & Timings', {
            'fields': ('date', 'start_time', 'end_time', 'time', 'day')
        }),
        ('Location & Media', {
            'fields': ('location', 'banner_url')
        }),
        ('Display & Visibility', {
            'fields': ('order', 'is_active', 'status')
        }),
        ('System Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def date_display(self, obj):
        if obj.date:
            return obj.date.strftime('%d %b %Y')
        return obj.day or "—"
    date_display.short_description = "Date / Day"

    def timing_display(self, obj):
        if obj.start_time and obj.end_time:
            return f"{obj.start_time} - {obj.end_time}"
        if obj.time:
            return obj.time
        if obj.start_time:
            return f"{obj.start_time} onwards"
        return "—"
    timing_display.short_description = "Timing"

