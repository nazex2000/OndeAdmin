from rest_framework import serializers
from .models import *

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=ProductCategory
        fields='__all__'

class ProductSerializer(serializers.ModelSerializer):
    category=ProductCategorySerializer()
    class Meta:
        model=Product
        fields='__all__'