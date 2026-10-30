from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Vehicule, Total, Jawaz

admin.site.register(Vehicule)
admin.site.register(Total)
admin.site.register(Jawaz)