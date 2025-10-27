const tbody = document.getElementById('violation-list');

function loadViolations() {
  fetch('/api/violations')
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No violations found</td></tr>';
        return;
      }
      data.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${v._id || v.id}</td>
          <td>${v.studentId}</td>
          <td>${v.violations.join(', ')}</td>
          <td>${new Date(v.timestamp).toLocaleString()}</td>
          <td>${v.status}</td>
          <td>
            ${v.status === 'Pending' ? `<button class="approve-btn" data-id="${v._id || v.id}">Approve</button>` : ''}
            ${v.status === 'Approved' ? `<button class="revoke-btn" data-id="${v._id || v.id}">Revoke</button>` : ''}
            ${v.status !== 'Pending' && v.status !== 'Approved' ? '<em>No action</em>' : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Add event listeners after the rows are added
      tbody.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          fetch(`/api/violations/${id}/approve`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              loadViolations();
            });
        });
      });

      tbody.querySelectorAll('.revoke-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          fetch(`/api/violations/${id}/revoke`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              loadViolations();
            });
        });
      });
    });
}

// Initial load
loadViolations();
