let lastScannedCode = null;

const resultDiv = document.getElementById('result');
const form = document.getElementById('violation-form');
const studentIdSpan = document.getElementById('student-id');

const config = {
  inputStream: {
    name: 'Live',
    type: 'LiveStream',
    target: document.querySelector('#camera'),
    constraints: { width: 640, height: 480, facingMode: 'environment' }
  },
  decoder: {
    readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader', 'upc_reader']
  }
};

Quagga.init(config, err => {
  if (err) {
    resultDiv.innerText = `Error initializing camera: ${err}`;
    console.error(err);
    return;
  }
  Quagga.start();
});

Quagga.onDetected(data => {
  const code = data.codeResult.code;
  if (code !== lastScannedCode) {
    lastScannedCode = code;
    resultDiv.innerText = `Student ID scanned: ${code}`;
    studentIdSpan.textContent = code;
    form.style.display = 'block';
    clearForm();
  }
});

function clearForm() {
  document.querySelectorAll('input[name=violation]').forEach(cb => cb.checked = false);
  document.getElementById('other-text').value = '';
}

document.getElementById('submit-violation').addEventListener('click', () => {
  const violations = [];
  document.querySelectorAll('input[name=violation]:checked').forEach(cb => violations.push(cb.value));
  const otherText = document.getElementById('other-text').value.trim();
  if (otherText) violations.push(otherText);

  if (!lastScannedCode) {
    alert('Please scan student ID!');
    return;
  }
  if (violations.length === 0) {
    alert('Select at least one violation or specify other violation.');
    return;
  }

  const record = { studentId: lastScannedCode, violations };

  fetch('/api/violations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  }).then(res => res.json())
    .then(data => {
      alert(data.message);
      lastScannedCode = null;
      resultDiv.innerText = 'Scan student ID barcode';
      studentIdSpan.textContent = '';
      clearForm();
      form.style.display = 'none';
    })
    .catch(() => alert('Failed to submit violation. Check server.'));
});

document.getElementById('review-btn').addEventListener('click', () => {
  window.location.href = 'hod.html';
});
