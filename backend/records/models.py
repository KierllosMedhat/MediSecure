"""
Records Models — Owner: Fadi

Defines MedicalRecord and Document models per ERD.
MedicalRecord holds clinical data; Document holds uploaded files.
"""

from django.db import models
from django.conf import settings


class MedicalRecord(models.Model):
    """
    A medical record entry for a patient, created by a staff member.
    """

    class RecordType(models.TextChoices):
        LAB_RESULT = "LAB_RESULT", "Lab Result"
        PRESCRIPTION = "PRESCRIPTION", "Prescription"
        DIAGNOSIS = "DIAGNOSIS", "Diagnosis"
        IMAGING = "IMAGING", "Imaging"
        CONSULTATION = "CONSULTATION", "Consultation"
        DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY", "Discharge Summary"
        VISIT_SUMMARY = "VISIT_SUMMARY", "Visit Summary"
        OTHER = "OTHER", "Other"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="medical_records",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_records",
        help_text="Staff member who created this record.",
    )
    record_type = models.CharField(
        max_length=30,
        choices=RecordType.choices,
        default=RecordType.OTHER,
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "medical_records"
        ordering = ["-created_at"]
        verbose_name = "Medical Record"
        verbose_name_plural = "Medical Records"

    def __str__(self):
        return f"{self.record_type}: {self.title}"


class Document(models.Model):
    """
    A file/document attached to a medical record.
    """

    class FileType(models.TextChoices):
        PDF = "PDF", "PDF"
        IMAGE = "IMAGE", "Image"
        DICOM = "DICOM", "DICOM"
        CSV = "CSV", "CSV"
        OTHER = "OTHER", "Other"

    record = models.ForeignKey(
        MedicalRecord,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents",
    )
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to="documents/%Y/%m/%d/")
    file_type = models.CharField(
        max_length=10,
        choices=FileType.choices,
        default=FileType.OTHER,
    )
    file_size = models.PositiveIntegerField(help_text="File size in bytes.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "documents"
        ordering = ["-created_at"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self):
        return self.file_name
