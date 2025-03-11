// Common functions for file handling and CSV processing

// Drag and drop event handlers
function setupDragAndDrop(dropzone, fileInput, handleFiles) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

    dropzone.addEventListener('click', () => fileInput.click(), false);
    dropzone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFiles, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function highlight() {
        dropzone.classList.add('dragover');
    }

    function unhighlight() {
        dropzone.classList.remove('dragover');
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        console.error('Error element not found:', message);
    }
}

function clearError() {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

// Check if file is CSV
function validateCSVFile(file) {
    if (!file.name.endsWith('.csv')) {
        showError('Please upload a CSV file.');
        return false;
    }
    return true;
}
