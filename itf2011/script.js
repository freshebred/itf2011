// Normalize Vietnamese text by removing diacritics
function normalizeVietnamese(str) {
  return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
}

// Calculate similarity between two strings
function similarity(s1, s2) {
  const normalize1 = normalizeVietnamese(s1);
  const normalize2 = normalizeVietnamese(s2);
  
  // Check if one string contains the other
  if (normalize1.includes(normalize2) || normalize2.includes(normalize1)) {
      return true;
  }
  
  // Split into words and check for matching parts
  const words1 = normalize1.split(' ');
  const words2 = normalize2.split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
      for (const word2 of words2) {
          if (word1 === word2) matches++;
      }
  }
  
  // Return true if more than 50% of words match
  return matches >= Math.min(words1.length, words2.length) * 0.5;
}

// Find matching teachers
function findMatchingTeachers(inputName) {
  return fetch('data.json')
      .then(response => response.json())
      .then(teachers => {
          const matches = teachers.filter(teacher => 
              similarity(teacher.name, inputName)
          );
          return matches;
      });
}

// Handle form submission
document.getElementById('nameForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  
  if (!name) return;

  try {
      const matches = await findMatchingTeachers(name);
      
      if (matches.length === 0) {
          // No matches found
          showError('No matching teacher found. Please check the spelling or try the full name.');
          return;
      }
      
      if (matches.length > 1) {
          // Multiple matches found - show disambiguation dialog
          showDisambiguationDialog(matches, name);
          return;
      }
      
      // Single match found - show message
      showTeacherMessage(matches[0]);
  } catch (error) {
      console.error('Error:', error);
      showError('An error occurred. Please try again.');
  }
});

// Show error message
function showError(message) {
  const formView = document.getElementById('form-view');
  const errorDiv = document.getElementById('error-message') || document.createElement('div');
  errorDiv.id = 'error-message';
  errorDiv.className = 'error-message fade-in';
  errorDiv.textContent = message;
  
  if (!document.getElementById('error-message')) {
      formView.insertBefore(errorDiv, document.getElementById('nameForm'));
  }
}

// Show disambiguation dialog
function showDisambiguationDialog(matches, inputName) {
  const formView = document.getElementById('form-view');
  const dialogDiv = document.createElement('div');
  dialogDiv.className = 'disambiguation-dialog fade-in';
  dialogDiv.innerHTML = `
      <p>Multiple matches found. Please select your name:</p>
      <div class="name-options">
          ${matches.map(teacher => `
              <button class="btn-glass name-option" data-name="${teacher.name}">
                  ${teacher.name}
              </button>
          `).join('')}
      </div>
      <button class="btn-glass cancel-btn">Cancel</button>
  `;
  
  // Hide the form
  document.getElementById('nameForm').style.display = 'none';
  formView.appendChild(dialogDiv);
  
  // Handle name selection
  dialogDiv.addEventListener('click', function(e) {
      if (e.target.classList.contains('name-option')) {
          const selectedTeacher = matches.find(t => t.name === e.target.dataset.name);
          showTeacherMessage(selectedTeacher);
          dialogDiv.remove();
      } else if (e.target.classList.contains('cancel-btn')) {
          dialogDiv.remove();
          document.getElementById('nameForm').style.display = 'flex';
      }
  });
}

// Show teacher message
function showTeacherMessage(teacher) {
  document.getElementById('teacherName').textContent = teacher.name;
  document.querySelector('.message').textContent = teacher.desc;
  document.getElementById('form-view').classList.add('hidden');
  
  const messageView = document.getElementById('message-view');
  messageView.classList.remove('hidden');
  messageView.classList.add('fade-in');
}