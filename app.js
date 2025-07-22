// DOM Elements
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__menu');
const navLinks = document.querySelectorAll('.nav__link');
const header = document.querySelector('.header');
const contactForm = document.querySelector('.contact__form');

// Mobile Navigation Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Close mobile menu when clicking on a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav') && navMenu && navMenu.classList.contains('active')) {
        if (navToggle) navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Header scroll effect
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    if (!header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add background opacity on scroll
    if (scrollTop > 50) {
        header.style.background = 'rgba(15, 23, 42, 0.98)';
        header.style.backdropFilter = 'blur(25px)';
    } else {
        header.style.background = 'rgba(15, 23, 42, 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    }

    // Hide/show header on scroll (optional)
    if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
});

// Enhanced smooth scrolling for navigation links - FIXED VERSION
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);

            if (target) {
                // Close mobile menu if open
                if (navToggle && navMenu) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }

                // Calculate position accounting for fixed header
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                // Smooth scroll to target
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });

                // Update active nav link
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');

                // Update URL hash
                setTimeout(() => {
                    if (history.pushState) {
                        history.pushState(null, null, `#${targetId}`);
                    }
                }, 100);
            }
        });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Add staggered animation for grid items
            if (entry.target.classList.contains('skill-card') ||
                entry.target.classList.contains('project-card') ||
                entry.target.classList.contains('highlight-card')) {

                const siblings = Array.from(entry.target.parentNode.children);
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
        }
    });
}, observerOptions);

// Elements to animate on scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.skill-card, .project-card, .highlight-card, .about__text');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Enhanced active navigation link highlighting - FIXED VERSION
const sections = document.querySelectorAll('section[id]');

function updateActiveNavLink() {
    const scrollPosition = window.pageYOffset + (header ? header.offsetHeight : 70) + 100;
    let current = '';

    // Check each section to find which one is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });

    // Handle edge cases for first and last sections
    if (window.pageYOffset < 100) {
        current = 'home';
    } else if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 100) {
        current = 'contact';
    }

    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Throttled scroll listener for active nav links
let navScrollTimeout;
window.addEventListener('scroll', () => {
    if (navScrollTimeout) {
        clearTimeout(navScrollTimeout);
    }
    navScrollTimeout = setTimeout(updateActiveNavLink, 10);
});

// Contact form handling
function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // Basic form validation
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        showNotification('Sending message...', 'info');

        emailjs.send('portfolio', 'portfolio_template', {
            from_name: name,
            from_email: email,
            message: message,
        }, 'h_uIKVElopWuHE3eX')
            .then(() => {
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            })
            .catch(() => {
                showNotification('Failed to send message. Please try again later.', 'error');
            });
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__message">${message}</span>
            <button class="notification__close" aria-label="Close notification">&times;</button>
        </div>
    `;

    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 1rem;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
            animation: slideInNotification 0.4s ease;
            font-family: "Inter", sans-serif;
        }
        
        .notification--success {
            background: rgba(16, 185, 129, 0.9);
            border-color: rgba(16, 185, 129, 0.3);
            color: white;
        }
        
        .notification--error {
            background: rgba(239, 68, 68, 0.9);
            border-color: rgba(239, 68, 68, 0.3);
            color: white;
        }
        
        .notification--info {
            background: rgba(100, 255, 218, 0.9);
            border-color: rgba(100, 255, 218, 0.3);
            color: #0f172a;
        }
        
        .notification__content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification__message {
            flex: 1;
            font-weight: 500;
        }
        
        .notification__close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        
        .notification__close:hover {
            opacity: 1;
        }
        
        @keyframes slideInNotification {
            from {
                opacity: 0;
                transform: translateX(100%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0) translateY(0);
            }
        }
        
        @keyframes slideOutNotification {
            from {
                opacity: 1;
                transform: translateX(0) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%) translateY(-20px);
            }
        }
    `;

    // Add styles to head if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = notificationStyles;
        document.head.appendChild(style);
    }

    // Add notification to DOM
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutNotification 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Parallax effect for hero section (subtle)
function initSubtleParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.2; // Very subtle effect

        if (scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Enhanced blur effect on scroll for transparent sections
function initEnhancedBlur() {
    const transparentSections = document.querySelectorAll('.section-transparent');

    window.addEventListener('scroll', () => {
        transparentSections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const sectionMiddle = rect.top + rect.height / 2;
            const viewportMiddle = window.innerHeight / 2;
            const distance = Math.abs(sectionMiddle - viewportMiddle);

            // Adjust blur based on distance from viewport center
            const maxBlur = 15;
            const minBlur = 8;
            const blurValue = Math.max(minBlur, maxBlur - (distance / 100));

            section.style.backdropFilter = `blur(${blurValue}px)`;
        });
    });
}

// Card hover effects enhancement
function initCardEffects() {
    const cards = document.querySelectorAll('.project-card, .skill-card, .highlight-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.backdropFilter = 'blur(20px)';
            card.style.transform = card.classList.contains('project-card')
                ? 'translateY(-10px) scale(1.02)'
                : 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            const originalBlur = card.classList.contains('project-card') ? '12px' :
                card.classList.contains('skill-card') ? '10px' : '8px';
            card.style.backdropFilter = `blur(${originalBlur})`;
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize dynamic background animation
function initDynamicBackground() {
    const background = document.querySelector('.fixed-background');
    if (!background) return;

    // Add subtle mouse movement effect
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2;
        const y = (e.clientY / window.innerHeight) * 2;

        background.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
    });
}

// Ensure proper section scrolling on page load
function initProperScrolling() {
    // Check if there's a hash in the URL and scroll to it
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        }, 1000);
    }
}

// Add glassmorphism effect on form focus
function initFormEffects() {
    const formControls = document.querySelectorAll('.form-control');

    formControls.forEach(control => {
        control.addEventListener('focus', () => {
            control.style.background = 'rgba(255, 255, 255, 0.2)';
            control.style.backdropFilter = 'blur(15px)';
        });

        control.addEventListener('blur', () => {
            control.style.background = 'rgba(255, 255, 255, 0.1)';
            control.style.backdropFilter = 'blur(10px)';
        });
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    // Close mobile menu on window resize
    if (window.innerWidth > 768) {
        if (navToggle) navToggle.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events for performance
const throttledScroll = throttle(() => {
    // Scroll handlers are managed individually above
}, 16); // ~60fps

window.addEventListener('scroll', throttledScroll);

function loadGitHubContributions(username, element = "#contribution") {
    fetch(`https://github-contributions-api.deno.dev/${username}.json`)
        .then(res => res.json())
        .then(data => {
            const total = data.totalContributions;
            document.querySelector(element).innerText = `${total} Contributions`;
        })
        .catch(err => {
            console.error("Failed to load GitHub contributions:", err);
            document.querySelector(element).innerText = "N/A";
        });
}

function loadGitHubRepoCount(username, element = "#repoCount") {
    fetch(`https://api.github.com/users/${username}`)
        .then(res => res.json())
        .then(data => {
            const totalRepos = data.public_repos;
            document.querySelector(element).innerText = `${totalRepos} Repositories`;
        })
        .catch(err => {
            console.error("Failed to fetch repo count:", err);
            document.querySelector(element).innerText = "N/A";
        });
}


// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core functionality first
    initSmoothScrolling();
    initContactForm();
    initProperScrolling();

    // Initialize visual enhancements
    setTimeout(() => {
        initScrollAnimations();
        updateActiveNavLink();
        initEnhancedBlur();
        initCardEffects();
        initFormEffects();
        initDynamicBackground();
        initSubtleParallax();
        loadGitHubContributions("Hemanggour");
        loadGitHubRepoCount("Hemanggour");
    }, 100);
});

// Ensure smooth scrolling works even if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScrolling);
} else {
    initSmoothScrolling();
}
