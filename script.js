// Dungeon & Co-Pilot - Interactive M365 Copilot Training

// Navigate to a stage (with lock checking)
function navigateToStage(sectionId) {
    const stageNumber = parseInt(sectionId.replace('stage', ''));
    const stageNode = document.querySelector(`.quest-node[data-stage="${stageNumber}"]`);
    
    // Check if the stage is unlocked or completed
    if (stageNode && (stageNode.classList.contains('unlocked') || stageNode.classList.contains('completed'))) {
        showSection(sectionId);
    } else {
        // Show a message that the stage is locked
        alert('🔒 This stage is locked! Complete the previous stage to unlock it.');
    }
}

// Navigate to next stage (with completion checking)
function navigateToNext(nextSectionId) {
    const currentSection = document.querySelector('section.active');
    
    if (!currentSection) {
        showSection(nextSectionId);
        return;
    }
    
    const checkboxes = currentSection.querySelectorAll('.completion-checklist input[type="checkbox"]');
    
    // If no checkboxes or all are checked, allow navigation
    if (checkboxes.length === 0 || Array.from(checkboxes).every(cb => cb.checked)) {
        showSection(nextSectionId);
    } else {
        alert('🔒 Please complete all tasks in the checklist before proceeding to the next stage!');
    }
}

// Show section and handle navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0);
        
        // Update quest map nodes based on progress
        updateQuestNodes();
        
        // Update next button state
        updateNextButton();
        
        // Save progress
        saveProgress(sectionId);
    }
}

// Copy prompt to clipboard
function copyPrompt(button) {
    const promptBox = button.previousElementSibling;
    const text = promptBox.querySelector('code').textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback
        fallbackCopy(text);
        button.textContent = '✓ Copied!';
        setTimeout(() => {
            button.textContent = '📋 Copy Prompt';
        }, 2000);
    });
}

// Fallback copy method
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
}

// Update progress bar based on checked items
function updateProgress() {
    const totalCheckboxes = document.querySelectorAll('.completion-checklist input[type="checkbox"]').length;
    const checkedCheckboxes = document.querySelectorAll('.completion-checklist input[type="checkbox"]:checked').length;
    
    const progress = (checkedCheckboxes / totalCheckboxes) * 100;
    
    // Update all progress bars
    document.querySelectorAll('.progress-bar .progress').forEach(bar => {
        bar.style.width = `${progress}%`;
    });
    
    // Save checkbox state
    saveCheckboxState();
    
    // Update quest nodes
    updateQuestNodes();
    
    // Update next button state for current stage
    updateNextButton();
}

// Update next button state based on current stage completion
function updateNextButton() {
    const currentSection = document.querySelector('section.active');
    if (!currentSection) return;
    
    const checkboxes = currentSection.querySelectorAll('.completion-checklist input[type="checkbox"]');
    const nextButton = currentSection.querySelector('.btn-next');
    
    if (checkboxes.length > 0 && nextButton) {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked) {
            nextButton.classList.remove('locked');
            nextButton.disabled = false;
        } else {
            nextButton.classList.add('locked');
            nextButton.disabled = true;
        }
    }
}

// Update quest map node states
function updateQuestNodes() {
    const stages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7'];
    const nodes = document.querySelectorAll('.quest-node');
    
    let lastCompletedIndex = -1;
    
    // Check completion status for each stage
    stages.forEach((stage, index) => {
        const stageSection = document.getElementById(stage);
        if (stageSection) {
            const checkboxes = stageSection.querySelectorAll('.completion-checklist input[type="checkbox"]');
            const allChecked = checkboxes.length > 0 && 
                Array.from(checkboxes).every(cb => cb.checked);
            
            if (allChecked) {
                lastCompletedIndex = index;
            }
        }
    });
    
    // Update node classes
    nodes.forEach((node, index) => {
        node.classList.remove('unlocked', 'completed');
        
        // Stage 1 is always unlocked
        if (index === 0) {
            node.classList.add('unlocked');
        } else if (index <= lastCompletedIndex) {
            node.classList.add('completed');
        } else if (index <= lastCompletedIndex + 1) {
            node.classList.add('unlocked');
        }
    });
}

// Save progress to localStorage
function saveProgress(currentSection) {
    try {
        localStorage.setItem('dungeonCopilot_currentSection', currentSection);
    } catch (e) {
        console.log('localStorage not available');
    }
}

// Save checkbox state
function saveCheckboxState() {
    try {
        const checkboxStates = {};
        document.querySelectorAll('.completion-checklist input[type="checkbox"]').forEach((cb, index) => {
            checkboxStates[`checkbox_${index}`] = cb.checked;
        });
        localStorage.setItem('dungeonCopilot_checkboxes', JSON.stringify(checkboxStates));
    } catch (e) {
        console.log('localStorage not available');
    }
}

// Load saved progress
function loadProgress() {
    try {
        // Load checkbox states
        const savedCheckboxes = localStorage.getItem('dungeonCopilot_checkboxes');
        if (savedCheckboxes) {
            const states = JSON.parse(savedCheckboxes);
            document.querySelectorAll('.completion-checklist input[type="checkbox"]').forEach((cb, index) => {
                if (states[`checkbox_${index}`] !== undefined) {
                    cb.checked = states[`checkbox_${index}`];
                }
            });
        }
        
        // Update progress display
        updateProgress();
        
        // Optionally load last section (commented out for fresh start each time)
        // const savedSection = localStorage.getItem('dungeonCopilot_currentSection');
        // if (savedSection) {
        //     showSection(savedSection);
        // }
    } catch (e) {
        console.log('Could not load saved progress');
    }
}

// Reset all progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        try {
            localStorage.removeItem('dungeonCopilot_checkboxes');
            localStorage.removeItem('dungeonCopilot_currentSection');
        } catch (e) {
            console.log('localStorage not available');
        }
        
        // Uncheck all checkboxes
        document.querySelectorAll('.completion-checklist input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Reset progress bars
        document.querySelectorAll('.progress-bar .progress').forEach(bar => {
            bar.style.width = '0%';
        });
        
        // Go back to landing
        showSection('landing');
    }
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC to go back
    if (e.key === 'Escape') {
        const currentSection = document.querySelector('section.active');
        if (currentSection && currentSection.id !== 'landing') {
            showSection('quest-map');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Show landing page by default
    showSection('landing');
    
    // Load any saved progress
    loadProgress();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add click handlers for quest nodes (enable all for demo)
    document.querySelectorAll('.quest-node').forEach(node => {
        node.classList.add('unlocked');
    });
});

// Add animation when entering stages
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe quest cards for animation
document.querySelectorAll('.quest-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeInObserver.observe(card);
});

// Add confetti effect on completion (optional fun feature)
function showConfetti() {
    const colors = ['#6C63FF', '#4ECDC4', '#FF6B6B', '#F39C12', '#2ECC71'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            animation: fall ${2 + Math.random() * 3}s linear forwards;
            z-index: 9999;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add confetti animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Trigger confetti when reaching completion page
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'completion') {
        setTimeout(showConfetti, 500);
    }
};

console.log('🐱 Dungeon & Co-Pilot loaded! Ready to begin your adventure!');
