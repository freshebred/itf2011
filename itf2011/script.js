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
  
    // Show loading overlay
    showLoadingOverlay(true);
  
    // Add loading animation
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.classList.add('loading');
    submitButton.disabled = true;
  
    try {
        // Simulate 1s loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        const matches = await findMatchingTeachers(name);
        
        if (matches.length === 0) {
            // No matches found
            showError('No matching teacher found. Please check the spelling or try the full name.');
            nameInput.classList.add('glow-red');
            setTimeout(() => {
                nameInput.classList.remove('glow-red');
            }, 2000);
            return;
        }
        
        if (matches.length > 1) {
            // Multiple matches found - show disambiguation dialog
            showDisambiguationDialog(matches, name);
            return;
        }
        
        // Single match found - show message and trigger confetti
        showTeacherMessage(matches[0]);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred. Please try again.');
    } finally {
        // Remove loading animation and hide overlay
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        showLoadingOverlay(false);
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
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
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
  
  // Count words in a string
  function countWords(str) {
    return str.trim().split(/\s+/).length;
  }
  
  // Handle input changes
  const inputBox = document.getElementById("nameInput");
  inputBox.addEventListener("input", handleInputChange);
  
  function handleInputChange() {
    const val = inputBox.value;
    const wordCount = countWords(val);
    const charCount = val.length;
  
    // Calculate glow intensity
    const charGlow = Math.min(charCount, 100); // Cap at 100 characters
    const wordGlow = Math.min(wordCount * 10, 100); // Cap at 10 words
    const totalGlow = Math.min(charGlow + wordGlow, 100); // Ensure total doesn't exceed 100%
  
    // Apply glow effect
    inputBox.style.boxShadow = `0 0 ${totalGlow}px ${totalGlow / 5}px rgba(255, 255, 255, ${totalGlow / 100})`;
  }
  
  // Reset input style
  function resetInputStyle() {
    inputBox.style.boxShadow = 'none';
  }
  
  // Add event listener to reset input style when form is submitted
  document.getElementById('nameForm').addEventListener('submit', resetInputStyle);
  
  // Add function to show and hide loading overlay
  function showLoadingOverlay(show) {
      const overlay = document.getElementById('loadingOverlay');
      if (show) {
          overlay.classList.add('active');
      } else {
          overlay.classList.remove('active');
      }
  }