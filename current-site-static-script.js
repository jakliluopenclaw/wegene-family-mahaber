document.addEventListener('DOMContentLoaded', function () {
    const MS_PER_DAY = 86400000;
    const today = new Date();
    const threeWeeksFromNow = new Date(today.getTime() + 21 * MS_PER_DAY);
    threeWeeksFromNow.setHours(0, 0, 0, 0);

    const yyyy = threeWeeksFromNow.getFullYear();
    const mm = String(threeWeeksFromNow.getMonth() + 1).padStart(2, '0');
    const dd = String(threeWeeksFromNow.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.setAttribute('min', minDate));

    dateInputs.forEach(input => {
        let previousValue = input.value;
        let submitted = false;

        input.addEventListener('change', () => {
            const newValue = input.value;
            if (submitted || !newValue || newValue === previousValue) return;

            // Safe date parse for Safari
            const [year, month, day] = newValue.split('-');
            const selected = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            selected.setHours(0, 0, 0, 0);

            if (selected < threeWeeksFromNow) {
                alert("❌ Please select a date at least 3 weeks from today.");
                input.value = '';
                return;
            }

            submitted = true;
            previousValue = newValue;

            const form = input.closest('form');
            if (form) form.submit();
        });
    });
});

/**
 * 📅 Works on PC (showPicker), iOS (focus), Android (click)
 */

function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function openDate(memberId) {
    alert("📱 Button tapped");  // ✅ Add this line
    
    console.log("📱 openDate called for memberId:", memberId);

    const existingInput = document.getElementById(`live-date-${memberId}`);
    if (existingInput) {
        console.log("📱 Existing live input found, focusing...");
        existingInput.focus();
        return;
    }

    const hiddenInput = document.getElementById(`date-${memberId}`);
    if (!hiddenInput) {
        console.log("❌ Hidden input not found!");
        return;
    }

    const input = document.createElement('input');
    input.type = 'date';
    input.required = true;
    input.min = hiddenInput.min;
    input.id = `live-date-${memberId}`;
    input.name = 'date';

    // Styling for visibility
    input.style.position = 'fixed';
    input.style.left = '50%';
    input.style.top = '50%';
    input.style.transform = 'translate(-50%, -50%)';
    input.style.zIndex = '9999';
    input.style.background = '#fff';
    input.style.padding = '12px 16px';
    input.style.border = '2px solid #3498db';
    input.style.borderRadius = '8px';
    input.style.fontSize = '16px';
    input.style.color = '#333';

    document.body.appendChild(input);
    input.focus();
    console.log("📱 Input created and focused");

    input.addEventListener('change', function () {
        if (!input.value) return;
        console.log("📅 Date selected:", input.value);
        hiddenInput.value = input.value;
        const form = hiddenInput.closest('form');
        if (form) {
            console.log("📨 Submitting form...");
            form.submit();
        }
        input.remove();
    });

    input.addEventListener('blur', () => {
        console.log("🔚 Input blurred, removing...");
        input.remove();
    });
}

