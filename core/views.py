from django.shortcuts import render


def register_complaint(request):
    if request.method == "POST":
        # Handle the form submission
        pass
    return render(request, "register_complaint.html")
