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
          <td>${v.id}</td>
          <td>${v.studentId}</td>
          <td>${v.violations.join(', ')}</td>
          <td>${new Date(v.timestamp).toLocaleString()}</td>
          <td>${v.status}</td>
          <td>
            ${v.status === 'Pending' ? `
              <button class="approve-btn" data-id="${v.id}">Approve</button>
              <button class="revoke-btn" data-id="${v.id}">Revoke</button>` :
              v.status === 'Approved' ?
              `<button class="revoke-btn" data-id="${v.id}">Revoke</button>` :
              `<em>No actions</em>`
            }
          </td>`;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.approve-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          fetch(`/api/violations/${id}/approve`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              loadViolations();
            })
            .catch(() => alert('Approval failed'));
        };
      });

      tbody.querySelectorAll('.revoke-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          fetch(`/api/violations/${id}/revoke`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              loadViolations();
            })
            .catch(() => alert('Revocation failed'));
        };
      });
    })
    .catch(() => {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Failed to load violations</td></tr>';
    });
}

loadViolations();
