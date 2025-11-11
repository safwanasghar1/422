// GradPath Application Logic

class GradPathApp {
    constructor() {
        this.userProgress = this.loadUserProgress();
        this.currentDragElement = null;
        this.dragSource = null;
        this.init();
    }

    init() {
        // Set year selector to match user progress
        const yearSelector = document.getElementById('userYear');
        if (yearSelector) {
            yearSelector.value = this.userProgress.year;
        }
        
        this.setupEventListeners();
        this.renderRoadmap();
        this.renderAvailableCourses();
        this.updateProgress();
        this.checkTransferCredits();
    }

    // Load user progress from localStorage or create default
    loadUserProgress() {
        const saved = localStorage.getItem('gradPathProgress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Validate that semesters array exists and has correct structure
                if (parsed.semesters && Array.isArray(parsed.semesters)) {
                    console.log('Loaded from localStorage:', {
                        semesterCount: parsed.semesters.length,
                        semesterIds: parsed.semesters.map(s => s.id)
                    });
                    // Ensure we have exactly 8 semesters - regenerate if needed
                    if (parsed.semesters.length !== 8) {
                        console.warn('Semester count mismatch! Expected 8, got', parsed.semesters.length);
                        // Regenerate semesters but preserve course assignments
                        const originalSemesters = parsed.semesters;
                        const newSemesters = generateSemesters(2025, "Fall");
                        // Map courses from old semesters to new ones
                        newSemesters.forEach(newSem => {
                            const oldSem = originalSemesters.find(os => os.id === newSem.id);
                            if (oldSem) {
                                newSem.courses = oldSem.courses || [];
                                newSem.credits = oldSem.credits || 0;
                                newSem.status = oldSem.status || newSem.status;
                            }
                        });
                        parsed.semesters = newSemesters;
                        console.log('Regenerated semesters:', {
                            semesterCount: parsed.semesters.length,
                            semesterIds: parsed.semesters.map(s => s.id)
                        });
                    }
                    return parsed;
                }
            } catch (e) {
                console.error('Error loading saved progress:', e);
            }
        }
        
        // Default progress for Aisha (Freshman scenario)
        // For Waqar (transfer student), uncomment transferCredits below
        const semesters = generateSemesters(2025, "Fall");
        
        // Pre-populate Fall 2025 with completed courses
        const fall2025 = semesters.find(s => s.id === "Fall2025");
        if (fall2025) {
            //fall2025.courses = ["CS111", "MATH180"];
            //fall2025.credits = 7;
            // fall2025.status = "completed"; // Removed - no semesters marked as completed
        }
        
        // Set Spring 2026 as current
        const spring2026 = semesters.find(s => s.id === "Spring2026");
        if (spring2026) {
            spring2026.status = "current";
        }
        
        return {
            userId: "aisha_rahman",
            year: "Freshman",
            major: "Computer Science",
            currentSemester: "Spring2026",
            semesters: semesters,
            transferCredits: [
                // Uncomment for transfer student scenario:
                // {
                //     id: "transfer1",
                //     externalCourse: "Intro to Algorithms",
                //     uicEquivalent: "CS251",
                //     status: "approved",
                //     credits: 3,
                //     mapped: false
                // }
            ],
            totalCredits: 0,
            projectedGraduation: "Spring2029"
        };
    }

    // Save user progress to localStorage
    saveUserProgress() {
        localStorage.setItem('gradPathProgress', JSON.stringify(this.userProgress));
    }

    // Setup event listeners
    setupEventListeners() {
        // Year selector
        document.getElementById('userYear').addEventListener('change', (e) => {
            this.userProgress.year = e.target.value;
            this.saveUserProgress();
            this.updateProgress();
        });

        // Course search
        document.getElementById('courseSearch').addEventListener('input', (e) => {
            this.filterAvailableCourses(e.target.value);
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterAvailableCourses(document.getElementById('courseSearch').value, e.target.value);
        });

        // Transfer credit modal
        document.getElementById('transferBtn')?.addEventListener('click', () => {
            this.openTransferModal();
        });

        document.getElementById('closeTransferModal')?.addEventListener('click', () => {
            this.closeTransferModal();
        });

        // Close modal on outside click
        document.getElementById('transferModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'transferModal') {
                this.closeTransferModal();
            }
        });

        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            if (confirm('Reset all progress and return to default state?')) {
                localStorage.removeItem('gradPathProgress');
                location.reload();
            }
        });

        // Feedback message close button
        document.getElementById('feedbackClose')?.addEventListener('click', () => {
            this.closeFeedback();
        });
    }

    // Render roadmap with semesters
    renderRoadmap() {
        const roadmapContainer = document.getElementById('roadmap');
        roadmapContainer.innerHTML = '';

        console.log('Rendering roadmap with semesters:', {
            totalSemesters: this.userProgress.semesters.length,
            semesterIds: this.userProgress.semesters.map(s => s.id)
        });

        this.userProgress.semesters.forEach((semester, index) => {
            try {
                console.log(`Creating semester card ${index + 1}/${this.userProgress.semesters.length}:`, {
                    id: semester.id,
                    term: semester.term,
                    year: semester.year,
                    courses: semester.courses.length,
                    credits: semester.credits,
                    status: semester.status
                });
                const semesterCard = this.createSemesterCard(semester);
                roadmapContainer.appendChild(semesterCard);
            } catch (error) {
                console.error(`Error creating semester card ${index + 1} (${semester.id}):`, error);
                // Continue rendering other semesters even if one fails
                // Create a placeholder to show something went wrong
                const errorCard = document.createElement('div');
                errorCard.className = 'semester-card';
                errorCard.innerHTML = `
                    <div class="semester-header">
                        <span class="semester-title">${semester.term} ${semester.year}</span>
                        <span class="semester-credits">Error</span>
                    </div>
                    <div class="semester-courses">
                        <div style="color: red; padding: 20px;">Error rendering semester</div>
                    </div>
                `;
                roadmapContainer.appendChild(errorCard);
            }
        });

        // Verify all semesters were added to DOM
        const renderedSemesters = roadmapContainer.querySelectorAll('.semester-card');
        console.log('Semesters rendered in DOM:', renderedSemesters.length, 'Expected:', this.userProgress.semesters.length);
        if (renderedSemesters.length !== this.userProgress.semesters.length) {
            console.error('MISMATCH: Not all semesters were rendered!');
        }
    }

    // Create semester card element
    createSemesterCard(semester) {
        const card = document.createElement('div');
        card.className = `semester-card ${semester.status}`;
        card.dataset.semesterId = semester.id;
        card.dataset.term = semester.term;
        card.dataset.year = semester.year;

        const header = document.createElement('div');
        header.className = 'semester-header';
        header.innerHTML = `
            <span class="semester-title">${semester.term} ${semester.year}</span>
            <span class="semester-credits">${semester.credits} credits</span>
        `;

        const coursesContainer = document.createElement('div');
        coursesContainer.className = 'semester-courses';

        if (semester.courses.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-semester';
            emptyState.textContent = 'Drop courses here';
            coursesContainer.appendChild(emptyState);
        } else {
            semester.courses.forEach((courseId, courseIndex) => {
                try {
                    const course = courseCatalog[courseId];
                    if (course) {
                        const courseElement = this.createCourseElement(course, semester.id);
                        coursesContainer.appendChild(courseElement);
                    } else {
                        console.warn(`Course not found in catalog: ${courseId} for semester ${semester.id}`);
                    }
                } catch (error) {
                    console.error(`Error adding course ${courseId} to semester ${semester.id}:`, error);
                    // Continue rendering other courses even if one fails
                }
            });
        }

        card.appendChild(header);
        card.appendChild(coursesContainer);

        // Drag and drop handlers - attach to both the card and the courses container
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            this.handleDragOver(e, semester);
        };
        
        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Drop handler called on semester:', semester.id);
            this.handleDrop(e, semester);
        };
        
        const handleDragLeave = (e) => {
            // Only handle if we're leaving the card itself, not just moving to a child
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                this.handleDragLeave(e);
            }
        };

        const handleDragEnter = (e) => {
            // Don't prevent default on dragenter - it can interfere with drop
            // Just stop propagation to prevent bubbling
            e.stopPropagation();
        };

        // Attach handlers to the main card - use capture phase for better reliability
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragenter', handleDragEnter);
        card.addEventListener('dragleave', handleDragLeave);
        
        // Also attach to courses container in case drops happen there
        coursesContainer.addEventListener('dragover', handleDragOver);
        coursesContainer.addEventListener('drop', handleDrop);
        coursesContainer.addEventListener('dragenter', handleDragEnter);

        return card;
    }

    // Create course element (for semester cards)
    createCourseElement(course, semesterId) {
        try {
            const element = document.createElement('div');
            element.className = 'semester-course';
            element.draggable = true;
            element.dataset.courseId = course.id;
            element.dataset.semesterId = semesterId;

            // Removed completedCourses check - no courses marked as completed

            const prerequisites = course.prerequisites || [];
            element.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name">${course.name}</div>
                <div class="course-meta">
                    <span>${course.credits} credits</span>
                    ${prerequisites.length > 0 ? `<span class="prerequisite-badge">Prereq</span>` : ''}
                </div>
            `;

            element.addEventListener('dragstart', (e) => this.handleDragStart(e, course.id, 'semester'));
            element.addEventListener('dragend', (e) => this.handleDragEnd(e));

            return element;
        } catch (error) {
            console.error('Error creating course element:', error, course);
            // Return a placeholder element to prevent rendering from stopping
            const errorElement = document.createElement('div');
            errorElement.className = 'semester-course';
            errorElement.textContent = `${course.code || 'Unknown'} - Error`;
            return errorElement;
        }
    }

    // Render available courses panel
    renderAvailableCourses() {
        const container = document.getElementById('availableCourses');
        container.innerHTML = '';

        const allCourses = Object.values(courseCatalog);
        const scheduledCourses = this.getAllScheduledCourses();

        // Check if specific courses exist in catalog
        const specificCourses = ['MATH181', 'MATH210', 'ENGL160', 'ENGL161'];
        console.log('Checking for specific courses in catalog:');
        specificCourses.forEach(courseId => {
            const exists = courseCatalog[courseId];
            console.log(`  ${courseId}: ${exists ? 'EXISTS' : 'NOT FOUND'}`, exists ? {
                code: exists.code,
                category: exists.category,
                prerequisites: exists.prerequisites
            } : '');
        });

        console.log('Rendering available courses:', {
            totalCourses: allCourses.length,
            scheduledCourses: scheduledCourses.length,
            scheduledCourseIds: scheduledCourses
        });

        allCourses.forEach(course => {
            // Don't show courses that are already scheduled
            if (scheduledCourses.includes(course.id)) {
                console.log(`Skipping ${course.code} - already scheduled`);
                return;
            }

            // Check if math elective should be hidden
            // We keep math electives visible even after 3 credits are selected, so users can see options
            // The validation will prevent adding more than 3 credits total
            if (this.shouldHideCourse(course.id)) {
                console.log(`Skipping ${course.code} - math elective limit reached (3 credits)`);
                return;
            }

            // Check if prerequisites are satisfied
            const canTake = this.canTakeCourse(course.id);
            const courseCard = this.createAvailableCourseCard(course, canTake);
            container.appendChild(courseCard);
            console.log(`Added ${course.code} to available courses (category: ${course.category}, canTake: ${canTake})`);
        });
        
        // Apply current filter after rendering
        const currentSearch = document.getElementById('courseSearch')?.value || '';
        const currentCategory = document.getElementById('categoryFilter')?.value || 'all';
        console.log('Applying filter:', { search: currentSearch, category: currentCategory });
        this.filterAvailableCourses(currentSearch, currentCategory);
    }

    // Create course card for available courses panel
    createAvailableCourseCard(course, canTake) {
        const card = document.createElement('div');
        card.className = `course-card ${canTake ? '' : 'blocked'}`;
        // Make all courses draggable - validation will handle invalid placements
        card.draggable = true;
        card.setAttribute('draggable', 'true');
        card.dataset.courseId = course.id;
        card.style.cursor = 'grab';
        card.style.userSelect = 'none';
        card.style.webkitUserSelect = 'none';
        card.style.webkitTouchCallout = 'none';

        // Create content elements
        const codeDiv = document.createElement('div');
        codeDiv.className = 'course-code';
        codeDiv.textContent = course.code;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'course-name';
        nameDiv.textContent = course.name;
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'course-meta';
        metaDiv.innerHTML = `
            <span>${course.credits} credits</span>
            <!-- Removed "Spring-only" or "Fall-only" badge since all courses are available in both terms -->
        `;
        
        card.appendChild(codeDiv);
        card.appendChild(nameDiv);
        card.appendChild(metaDiv);
        
        // Add prerequisite info if needed
        const prerequisites = course.prerequisites || [];
        const concurrentPrerequisites = course.concurrentPrerequisites || [];
        if (!canTake && (prerequisites.length > 0 || concurrentPrerequisites.length > 0)) {
            const prereqDiv = document.createElement('div');
            prereqDiv.style.cssText = 'font-size: 0.8em; color: var(--color-error); margin-top: 5px;';
            let prereqText = '';
            if (prerequisites.length > 0) {
                prereqText = `Requires: ${prerequisites.map(p => courseCatalog[p]?.code || p).join(', ')}`;
            }
            if (concurrentPrerequisites.length > 0) {
                const concurrentText = `Concurrent: ${concurrentPrerequisites.map(p => courseCatalog[p]?.code || p).join(', ')}`;
                prereqText += (prereqText ? '<br/>' : '') + concurrentText;
            }
            prereqDiv.innerHTML = prereqText;
            card.appendChild(prereqDiv);
        }

        // Add drag handlers for all courses
        card.addEventListener('dragstart', (e) => {
            console.log('Drag start for:', course.id, 'draggable:', card.draggable, 'card element:', card);
            e.stopPropagation();
            // Make sure we're passing the card element, not the event target
            this.handleDragStart(e, course.id, 'available');
        }, true); // Use capture phase to ensure it fires
        
        card.addEventListener('dragend', (e) => {
            console.log('Drag end for:', course.id);
            e.stopPropagation();
            this.handleDragEnd(e);
        });

        return card;
    }

    // Check if user can take a course (prerequisites satisfied or scheduled)
    // This is used for visual indication only - all courses are draggable
    canTakeCourse(courseId) {
        const course = courseCatalog[courseId];
        if (!course) {
            console.warn('canTakeCourse: Course not found:', courseId);
            return false;
        }

        // Handle courses with no prerequisites array (should be empty array)
        const prerequisites = course.prerequisites || [];
        const concurrentPrerequisites = course.concurrentPrerequisites || [];

        // A course is available if ALL prerequisites are either:
        // 1. Completed, OR
        // 2. Scheduled in a semester (even if not yet completed)
        const prereqsSatisfied = prerequisites.every(prereq => {
            // Check if scheduled in any semester
            const scheduledCourses = this.getAllScheduledCourses();
            return scheduledCourses.includes(prereq);
        });

        // For concurrent prerequisites, we're more lenient - they can be:
        // 1. Completed, OR
        // 2. Scheduled in any semester, OR
        // 3. Not scheduled yet (will be validated when placing)
        // This allows users to drag courses even if concurrent prereqs aren't scheduled yet
        const concurrentPrereqsSatisfied = concurrentPrerequisites.every(prereq => {
            // Check if scheduled in any semester (concurrent means same semester is OK)
            const scheduledCourses = this.getAllScheduledCourses();
            if (scheduledCourses.includes(prereq)) {
                return true;
            }
            
            // Not scheduled yet - but that's OK for concurrent prerequisites
            // The validation will check when placing the course
            return true;
        });

        const result = prereqsSatisfied && concurrentPrereqsSatisfied;
        console.log(`canTakeCourse(${courseId}):`, {
            prerequisites,
            prereqsSatisfied,
            concurrentPrerequisites,
            concurrentPrereqsSatisfied,
            result
        });
        return result;
    }

    // Get all scheduled courses
    getAllScheduledCourses() {
        return this.userProgress.semesters.flatMap(s => s.courses);
    }

    // Get math elective courses (excluding required statistics courses)
    getMathElectives() {
        return [
            "MATH215", "MATH218", "MATH220", "MATH320", "MATH430", 
            "MATH435", "MATH436", "MCS421", "MCS423", "MCS471", 
            "STAT401", "STAT473"
        ];
    }

    // Get required statistics courses (must take one)
    getRequiredStatisticsCourses() {
        return ["IE342", "STAT381"];
    }

    // Get science elective courses
    getScienceElectives() {
        return [
            "BIOS110", "BIOS120", "CHEM122", "CHEM123", "CHEM116",
            "CHEM124", "CHEM125", "CHEM118", "PHYS141", "PHYS142",
            "EAES101", "EAES111"
        ];
    }

    // Get CS elective courses (tech electives)
    getCSElectives() {
        return [
            "CS407", "CS411", "CS418", "CS422", "CS440", "CS351"
        ];
    }

    // Get count of CS elective courses already scheduled
    // This is used to check if we've reached the 6-course limit
    getCSElectiveCourseCount(excludeCourseId = null) {
        const scheduledCourses = this.getAllScheduledCourses();
        const csElectives = this.getCSElectives();
        
        let count = 0;
        csElectives.forEach(courseId => {
            // Skip if this is the course we're excluding (e.g., when moving a course)
            if (excludeCourseId && courseId === excludeCourseId) {
                return;
            }
            
            if (scheduledCourses.includes(courseId)) {
                count++;
            }
        });
        
        console.log(`getCSElectiveCourseCount(exclude: ${excludeCourseId}):`, {
            count,
            csElectives: csElectives.filter(id => {
                if (excludeCourseId && id === excludeCourseId) return false;
                return scheduledCourses.includes(id);
            })
        });
        
        return count;
    }

    // Get count of science elective courses already scheduled
    // This is used to check if we've reached the 2-course limit
    getScienceElectiveCourseCount(excludeCourseId = null) {
        const scheduledCourses = this.getAllScheduledCourses();
        const scienceElectives = this.getScienceElectives();
        
        let count = 0;
        scienceElectives.forEach(courseId => {
            // Skip if this is the course we're excluding (e.g., when moving a course)
            if (excludeCourseId && courseId === excludeCourseId) {
                return;
            }
            
            if (scheduledCourses.includes(courseId)) {
                count++;
            }
        });
        
        console.log(`getScienceElectiveCourseCount(exclude: ${excludeCourseId}):`, {
            count,
            scienceElectives: scienceElectives.filter(id => {
                if (excludeCourseId && id === excludeCourseId) return false;
                return scheduledCourses.includes(id);
            })
        });
        
        return count;
    }

    // Check if student has taken at least one required statistics course
    hasRequiredStatistics() {
        const scheduledCourses = this.getAllScheduledCourses();
        const requiredStats = this.getRequiredStatisticsCourses();
        return requiredStats.some(courseId => 
            scheduledCourses.includes(courseId)
        );
    }

    // Get total math elective credits already scheduled
    // Optionally exclude a course ID (useful when checking if adding a course would exceed limit)
    getMathElectiveCredits(excludeCourseId = null) {
        const scheduledCourses = this.getAllScheduledCourses();
        const mathElectives = this.getMathElectives();
        
        let totalCredits = 0;
        const foundCourses = [];
        
        mathElectives.forEach(courseId => {
            // Skip if this is the course we're excluding (e.g., when moving a course)
            if (excludeCourseId && courseId === excludeCourseId) {
                return;
            }
            
            if (scheduledCourses.includes(courseId)) {
                const course = courseCatalog[courseId];
                if (course) {
                    totalCredits += course.credits;
                    foundCourses.push({ id: courseId, code: course.code, credits: course.credits });
                }
            }
        });
        
        console.log(`getMathElectiveCredits(exclude: ${excludeCourseId}):`, {
            totalCredits,
            foundCourses: foundCourses.map(f => `${f.code} (${f.credits})`).join(', ')
        });
        
        return totalCredits;
    }

    // Get count of math elective courses already scheduled
    // This includes both math electives AND required statistics courses (IE342/STAT381)
    // This is used to check if we've reached the 3-course limit
    getMathElectiveCourseCount(excludeCourseId = null) {
        const scheduledCourses = this.getAllScheduledCourses();
        const mathElectives = this.getMathElectives();
        const requiredStats = this.getRequiredStatisticsCourses();
        
        let count = 0;
        
        // Count math electives
        mathElectives.forEach(courseId => {
            // Skip if this is the course we're excluding (e.g., when moving a course)
            if (excludeCourseId && courseId === excludeCourseId) {
                return;
            }
            
            if (scheduledCourses.includes(courseId)) {
                count++;
            }
        });
        
        // Count required statistics courses (IE342/STAT381) - they count toward the math elective limit
        requiredStats.forEach(courseId => {
            // Skip if this is the course we're excluding (e.g., when moving a course)
            if (excludeCourseId && courseId === excludeCourseId) {
                return;
            }
            
            if (scheduledCourses.includes(courseId)) {
                count++;
            }
        });
        
        console.log(`getMathElectiveCourseCount(exclude: ${excludeCourseId}):`, {
            count,
            mathElectives: mathElectives.filter(id => {
                if (excludeCourseId && id === excludeCourseId) return false;
                return scheduledCourses.includes(id);
            }),
            requiredStats: requiredStats.filter(id => {
                if (excludeCourseId && id === excludeCourseId) return false;
                return scheduledCourses.includes(id);
            })
        });
        
        return count;
    }

    // Check if a course should be hidden from available courses
    shouldHideCourse(courseId) {
        const course = courseCatalog[courseId];
        if (!course) return false;

        const mathElectives = this.getMathElectives();
        const requiredStats = this.getRequiredStatisticsCourses();
        
        // Check if this is a math elective or required statistics course
        const isMathElective = mathElectives.includes(courseId);
        const isRequiredStat = requiredStats.includes(courseId);
        
        if (isMathElective || isRequiredStat) {
            // Get current count of math elective courses (including required stats)
            const currentCourseCount = this.getMathElectiveCourseCount();
            console.log(`shouldHideCourse(${course.code}): currentCourseCount = ${currentCourseCount}, maxCourses = 3`);
            
            // Hide math electives and required stats if 3 courses are already selected
            if (currentCourseCount >= 3) {
                console.log(`Hiding ${course.code} because 3 math elective courses (including required statistics) are already selected`);
                return true;
            }
        }
        
        // If this is a required statistics course, hide the other one if one is already taken
        if (isRequiredStat) {
            const scheduledCourses = this.getAllScheduledCourses();
            const hasOtherRequiredStat = requiredStats
                .filter(id => id !== courseId)
                .some(id => 
                    scheduledCourses.includes(id)
                );
            
            if (hasOtherRequiredStat) {
                console.log(`Hiding ${course.code} because the other required statistics course is already selected`);
                return true;
            }
        }
        
        // Check if this is a science elective
        const scienceElectives = this.getScienceElectives();
        if (scienceElectives.includes(courseId)) {
            // Get current count of science elective courses
            const currentCourseCount = this.getScienceElectiveCourseCount();
            console.log(`shouldHideCourse(${course.code}): currentCourseCount = ${currentCourseCount}, maxCourses = 2`);
            
            // Hide science electives if 2 courses are already selected
            if (currentCourseCount >= 2) {
                console.log(`Hiding ${course.code} because 2 science elective courses are already selected`);
                return true;
            }
        }
        
        // Check if this is a CS elective
        const csElectives = this.getCSElectives();
        if (csElectives.includes(courseId)) {
            // Get current count of CS elective courses
            const currentCourseCount = this.getCSElectiveCourseCount();
            console.log(`shouldHideCourse(${course.code}): currentCourseCount = ${currentCourseCount}, maxCourses = 6`);
            
            // Hide CS electives if 6 courses are already selected
            if (currentCourseCount >= 6) {
                console.log(`Hiding ${course.code} because 6 CS elective courses are already selected`);
                return true;
            }
        }
        
        return false;
    }

    // Drag and drop handlers
    handleDragStart(e, courseId, source) {
        console.log('handleDragStart called:', courseId, 'target:', e.target);
        // Store reference to the card element, not just the target (which might be a child)
        this.currentDragElement = e.target.closest('.course-card, .semester-course') || e.target;
        this.dragSource = source;
        this.currentDragCourseId = courseId; // Store course ID directly for easier access
        
        // Make sure the element has the dataset
        if (!this.currentDragElement.dataset.courseId) {
            this.currentDragElement.dataset.courseId = courseId;
        }
        
        this.currentDragElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', courseId);
        e.dataTransfer.setData('application/json', JSON.stringify({ courseId, source }));
        
        console.log('Drag data set:', {
            courseId,
            storedCourseId: this.currentDragCourseId,
            element: this.currentDragElement,
            dataset: this.currentDragElement.dataset.courseId
        });
    }

    handleDragOver(e, semester) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        // Get course ID - NOTE: dataTransfer.getData() only works in drop event, not dragover
        // So we need to use the stored currentDragElement or find the dragging element
        let courseId = null;
        
        // First try to get from stored course ID (most reliable)
        if (this.currentDragCourseId) {
            courseId = this.currentDragCourseId;
            console.log('DragOver: Course ID from currentDragCourseId:', courseId);
        }
        
        // If not found, try to get from currentDragElement (stored in dragstart)
        if (!courseId && this.currentDragElement) {
            courseId = this.currentDragElement.dataset.courseId;
            if (courseId) {
                console.log('DragOver: Course ID from currentDragElement:', courseId);
            }
        }
        
        // If not found, try to get from dragging element in DOM
        if (!courseId) {
            const draggingElement = document.querySelector('.course-card.dragging, .semester-course.dragging');
            if (draggingElement) {
                courseId = draggingElement.dataset.courseId;
                if (courseId) {
                    console.log('DragOver: Course ID from dragging element:', courseId);
                }
            }
        }
        
        if (!courseId) {
            console.warn('DragOver: No course ID found', {
                currentDragCourseId: this.currentDragCourseId,
                currentDragElement: this.currentDragElement,
                draggingElements: document.querySelectorAll('.course-card.dragging, .semester-course.dragging')
            });
            return; // Can't validate without course ID
        }
        
        // Get semester ID from parameter or dataset
        const semesterId = semester?.id || e.currentTarget?.dataset?.semesterId;
        
        if (!semesterId) {
            console.warn('DragOver: No semester ID found', {
                semester: semester,
                currentTarget: e.currentTarget,
                dataset: e.currentTarget?.dataset
            });
            return;
        }
        
        console.log('DragOver: Validating', courseId, '->', semesterId);
        const validation = this.validateCoursePlacement(courseId, semesterId);
        console.log('DragOver: Validation result', validation);

        const semesterCard = e.currentTarget;
        if (semesterCard) {
            semesterCard.classList.remove('valid-drop', 'invalid-drop');

            if (validation.valid) {
                semesterCard.classList.add('valid-drop');
                console.log('DragOver: Valid drop zone');
            } else {
                semesterCard.classList.add('invalid-drop');
                console.log('DragOver: Invalid drop zone:', validation.reason);
            }
        }
    }

    handleDrop(e, semester) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Drop event triggered', { semester: semester?.id, target: e.currentTarget });
        
        // Get course ID from dataTransfer - try JSON first, then text
        let courseId = null;
        try {
            const jsonData = e.dataTransfer.getData('application/json');
            if (jsonData) {
                const data = JSON.parse(jsonData);
                courseId = data.courseId;
                console.log('Course ID from JSON:', courseId);
            }
        } catch (err) {
            console.log('Could not parse JSON data:', err);
        }
        
        if (!courseId) {
            courseId = e.dataTransfer.getData('text/plain');
            console.log('Course ID from text/plain:', courseId);
        }
        
        if (!courseId && this.currentDragElement) {
            courseId = this.currentDragElement.dataset.courseId;
            console.log('Course ID from currentDragElement:', courseId);
        }
        
        // Also try getting from dataset if still not found
        if (!courseId) {
            const draggedCard = document.querySelector('.course-card.dragging, .semester-course.dragging');
            if (draggedCard) {
                courseId = draggedCard.dataset.courseId;
                console.log('Course ID from dragging element:', courseId);
            }
        }
        
        if (!courseId) {
            console.error('No course ID found in drop event');
            this.showFeedback('error', 'Unable to identify course');
            return;
        }
        
        // Get semester ID from parameter or dataset
        const semesterId = semester?.id || e.currentTarget?.dataset?.semesterId;
        console.log('Semester ID:', semesterId);
        
        if (!semesterId) {
            console.error('No semester ID found');
            this.showFeedback('error', 'Unable to identify semester');
            return;
        }
        
        console.log('Validating placement:', courseId, '->', semesterId);
        const validation = this.validateCoursePlacement(courseId, semesterId);
        console.log('Validation result:', validation);

        // DOUBLE-CHECK: Ensure validation actually prevents the course from being added
        if (!validation.valid) {
            console.error('VALIDATION FAILED - preventing course addition:', validation.reason);
            this.showFeedback('error', validation.reason || 'Cannot place course here');
            // Reset visual state
            if (e.currentTarget) {
                e.currentTarget.classList.remove('valid-drop', 'invalid-drop');
            }
            return; // CRITICAL: Exit early to prevent course from being added
        }

        // Only add course if validation passed
        console.log('Validation passed - adding course to semester');
        this.addCourseToSemester(courseId, semesterId);
        this.showFeedback('success', validation.message || 'Course added successfully!');

        // Reset visual state
        if (e.currentTarget) {
            e.currentTarget.classList.remove('valid-drop', 'invalid-drop');
        }
        this.renderRoadmap();
        this.renderAvailableCourses();
        this.updateProgress();
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('valid-drop', 'invalid-drop');
    }

    handleDragEnd(e) {
        console.log('Drag end event');
        // Remove dragging class from all elements (in case target changed)
        document.querySelectorAll('.course-card.dragging, .semester-course.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        // Also try to remove from the target
        if (e.target) {
            e.target.classList.remove('dragging');
        }
        // Remove all drop zone highlights
        document.querySelectorAll('.semester-card').forEach(card => {
            card.classList.remove('valid-drop', 'invalid-drop');
        });
        // Clear the current drag element and course ID
        this.currentDragElement = null;
        this.currentDragCourseId = null;
    }

    // Validate course placement
    validateCoursePlacement(courseId, semesterId) {
        // Get course directly from catalog to ensure we have latest data
        const course = courseCatalog[courseId];
        if (!course) {
            return { valid: false, reason: 'Course not found' };
        }

        const semester = this.userProgress.semesters.find(s => s.id === semesterId);
        if (!semester) {
            return { valid: false, reason: 'Semester not found' };
        }

        // Cannot add courses to completed semesters
        if (semester.status === 'completed') {
            return { valid: false, reason: 'Cannot modify completed semesters' };
        }

        // Validate math elective requirements
        const mathElectives = this.getMathElectives();
        const requiredStats = this.getRequiredStatisticsCourses();
        
        // Check if this is a math elective OR a required statistics course
        // Both count toward the 3-course math elective limit
        if (mathElectives.includes(courseId) || requiredStats.includes(courseId)) {
            // Get current count of math elective courses (including required stats), excluding this course if it's already scheduled (being moved)
            const scheduledCourses = this.getAllScheduledCourses();
            const isAlreadyScheduled = scheduledCourses.includes(courseId);
            const currentCourseCount = this.getMathElectiveCourseCount(isAlreadyScheduled ? courseId : null);
            
            console.log(`Math elective validation for ${course.code}:`, {
                courseId,
                isAlreadyScheduled,
                currentCourseCount,
                maxCourses: 3,
                isRequiredStat: requiredStats.includes(courseId),
                isMathElective: mathElectives.includes(courseId)
            });
            
            // Check if adding this course would exceed 3 math elective courses total
            // Allow up to 3 courses total (including required statistics)
            // Block only if it would exceed 3 courses (currentCourseCount >= 3)
            if (currentCourseCount >= 3) {
                return {
                    valid: false,
                    reason: `You have already selected 3 math elective courses (including required statistics). Maximum allowed: 3 courses total.`
                };
            }
        }

        // Check if trying to take both required statistics courses
        if (requiredStats.includes(courseId)) {
            const scheduledCourses = this.getAllScheduledCourses();
            const hasOtherRequiredStat = requiredStats
                .filter(id => id !== courseId)
                .some(id => 
                    scheduledCourses.includes(id)
                );
            
            if (hasOtherRequiredStat) {
                return {
                    valid: false,
                    reason: `You must take only ONE of ${requiredStats.map(id => courseCatalog[id]?.code || id).join(' or ')}. You have already selected one of these courses.`
                };
            }
        }

        // Validate science elective requirements
        const scienceElectives = this.getScienceElectives();
        
        // Check if this is a science elective
        if (scienceElectives.includes(courseId)) {
            // Get current count of science elective courses, excluding this course if it's already scheduled (being moved)
            const scheduledCourses = this.getAllScheduledCourses();
            const isAlreadyScheduled = scheduledCourses.includes(courseId);
            const currentCourseCount = this.getScienceElectiveCourseCount(isAlreadyScheduled ? courseId : null);
            
            console.log(`Science elective validation for ${course.code}:`, {
                courseId,
                isAlreadyScheduled,
                currentCourseCount,
                maxCourses: 2
            });
            
            // Check if adding this course would exceed 2 science elective courses total
            // Allow up to 2 courses total
            // Block only if it would exceed 2 courses (currentCourseCount >= 2)
            if (currentCourseCount >= 2) {
                return {
                    valid: false,
                    reason: `You have already selected 2 science elective courses. Maximum allowed: 2 courses total.`
                };
            }
        }

        // Validate CS elective requirements
        const csElectives = this.getCSElectives();
        
        // Check if this is a CS elective
        if (csElectives.includes(courseId)) {
            // Get current count of CS elective courses, excluding this course if it's already scheduled (being moved)
            const scheduledCourses = this.getAllScheduledCourses();
            const isAlreadyScheduled = scheduledCourses.includes(courseId);
            const currentCourseCount = this.getCSElectiveCourseCount(isAlreadyScheduled ? courseId : null);
            
            console.log(`CS elective validation for ${course.code}:`, {
                courseId,
                isAlreadyScheduled,
                currentCourseCount,
                maxCourses: 6
            });
            
            // Check if adding this course would exceed 6 CS elective courses total
            // Allow up to 6 courses total
            // Block only if it would exceed 6 courses (currentCourseCount >= 6)
            if (currentCourseCount >= 6) {
                return {
                    valid: false,
                    reason: `You have already selected 6 CS elective courses. Maximum allowed: 6 courses total.`
                };
            }
        }

        // Check term availability
        // DISABLED: All courses are now offered in both Fall and Spring
        // User requested all courses to be available in all semesters
        // This validation is skipped to allow any course in any semester
        /*
        // Original term availability check - DISABLED
        const courseOfferedIn = course.offeredIn || ["Fall", "Spring"];
        if (courseOfferedIn && courseOfferedIn.length > 0) {
            if (!courseOfferedIn.includes(semester.term)) {
                const suggestedSemesters = this.userProgress.semesters.filter(s => 
                    courseOfferedIn.includes(s.term) && 
                    s.year >= semester.year &&
                    s.status !== 'completed'
                );
                
                if (suggestedSemesters.length > 0) {
                    return {
                        valid: false,
                        reason: `${course.code} is offered ${courseOfferedIn.join('/')}-only`,
                        suggestedSemesters: suggestedSemesters.map(s => s.id)
                    };
                }
            }
        }
        */

        // Check prerequisites (must be completed before)
        const prerequisites = course.prerequisites || [];
        const missingPrereqs = prerequisites.filter(prereq => {
            // Check if prerequisite is scheduled before this semester
            const prereqSemester = this.findCourseSemester(prereq);
            if (prereqSemester) {
                const prereqIndex = this.userProgress.semesters.findIndex(s => s.id === prereqSemester);
                const currentIndex = this.userProgress.semesters.findIndex(s => s.id === semesterId);
                return prereqIndex >= currentIndex;
            }
            
            return true;
        });

        // Check concurrent prerequisites (can be in same semester or before)
        const missingConcurrentPrereqs = (course.concurrentPrerequisites || []).filter(prereq => {
            // Check if prerequisite is scheduled in same semester or before
            const prereqSemester = this.findCourseSemester(prereq);
            if (prereqSemester) {
                const prereqIndex = this.userProgress.semesters.findIndex(s => s.id === prereqSemester);
                const currentIndex = this.userProgress.semesters.findIndex(s => s.id === semesterId);
                // Allow same semester (concurrent) or earlier - so prereqIndex must be <= currentIndex
                // If prereqIndex > currentIndex, the prerequisite is scheduled later, which is not allowed
                if (prereqIndex <= currentIndex) {
                    return false; // Prerequisite is satisfied (same semester or earlier)
                }
                return true; // Prerequisite is scheduled later - not allowed
            }
            
            // Prerequisite is not scheduled yet - this is OK for concurrent prerequisites
            // User can add both to the same semester, or add prerequisite first
            // We allow it and let the user figure it out - they'll get a warning if they try to place it incorrectly
            return false; // Allow concurrent prerequisites to be added together
        });

        if (missingPrereqs.length > 0) {
            const prereqNames = missingPrereqs.map(p => courseCatalog[p]?.code || p).join(', ');
            return {
                valid: false,
                reason: `${course.code} requires ${prereqNames} to be completed first`
            };
        }

        if (missingConcurrentPrereqs.length > 0) {
            const concurrentNames = missingConcurrentPrereqs.map(p => courseCatalog[p]?.code || p).join(', ');
            return {
                valid: false,
                reason: `${course.code} requires ${concurrentNames} to be taken concurrently (same semester) or completed first`
            };
        }

        // Check if moving this course would invalidate courses that depend on it
        // Find all courses that have this course as a prerequisite (regular or concurrent)
        const dependentCourses = Object.values(courseCatalog).filter(c => {
            if (!c) return false;
            // Check if it's a regular prerequisite
            if (c.prerequisites && Array.isArray(c.prerequisites) && c.prerequisites.includes(courseId)) {
                return true;
            }
            // Check if it's a concurrent prerequisite
            if (c.concurrentPrerequisites && Array.isArray(c.concurrentPrerequisites) && c.concurrentPrerequisites.includes(courseId)) {
                return true;
            }
            return false;
        });

        // Check each dependent course to see if it's scheduled before the new semester
        for (const dependentCourse of dependentCourses) {
            const dependentSemester = this.findCourseSemester(dependentCourse.id);
            if (dependentSemester) {
                const dependentIndex = this.userProgress.semesters.findIndex(s => s.id === dependentSemester);
                const newIndex = this.userProgress.semesters.findIndex(s => s.id === semesterId);
                
                // Check if it's a regular prerequisite (must be before) or concurrent (can be same semester)
                const isConcurrent = dependentCourse.concurrentPrerequisites && 
                                    dependentCourse.concurrentPrerequisites.includes(courseId);
                
                if (isConcurrent) {
                    // For concurrent prerequisites, same semester is OK, but later is not
                    if (dependentIndex < newIndex) {
                        return {
                            valid: false,
                            reason: `${dependentCourse.code} requires ${course.code} to be taken concurrently (same semester) or completed first, but ${dependentCourse.code} is scheduled in ${this.userProgress.semesters[dependentIndex].term} ${this.userProgress.semesters[dependentIndex].year}`
                        };
                    }
                } else {
                    // For regular prerequisites, must be before (not same semester)
                    if (dependentIndex <= newIndex) {
                        return {
                            valid: false,
                            reason: `${dependentCourse.code} requires ${course.code} to be completed first, but ${dependentCourse.code} is scheduled in ${this.userProgress.semesters[dependentIndex].term} ${this.userProgress.semesters[dependentIndex].year}`
                        };
                    }
                }
            }
        }

        return { valid: true, message: `${course.code} added to ${semester.term} ${semester.year}` };
    }

    // Find which semester a course is in
    findCourseSemester(courseId) {
        for (const semester of this.userProgress.semesters) {
            if (semester.courses.includes(courseId)) {
                return semester.id;
            }
        }
        return null;
    }

    // Add course to semester
    addCourseToSemester(courseId, semesterId) {
        // Remove from previous semester if exists
        this.removeCourseFromSemester(courseId);

        const semester = this.userProgress.semesters.find(s => s.id === semesterId);
        if (semester && !semester.courses.includes(courseId)) {
            semester.courses.push(courseId);
            semester.credits += courseCatalog[courseId].credits;
        }

        this.saveUserProgress();
    }

    // Remove course from semester
    removeCourseFromSemester(courseId) {
        this.userProgress.semesters.forEach(semester => {
            const index = semester.courses.indexOf(courseId);
            if (index > -1) {
                semester.courses.splice(index, 1);
                semester.credits -= courseCatalog[courseId]?.credits || 0;
            }
        });
    }

    // Update progress indicators
    updateProgress() {
        // Calculate total credits from all scheduled courses
        const totalCredits = this.userProgress.semesters.reduce((sum, semester) => {
            return sum + semester.credits;
        }, 0);
        this.userProgress.totalCredits = totalCredits;

        // Update progress bar
        const percentage = Math.min((totalCredits / 128) * 100, 100);
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}% Complete`;

        // Update graduation date
        this.updateGraduationDate();

        // Update credits display
        document.getElementById('totalCredits').textContent = totalCredits;

        // Show encouraging messages
        this.showProgressMessage(percentage);
    }

    // Update projected graduation date
    updateGraduationDate() {
        const remainingCredits = 128 - this.userProgress.totalCredits;
        let creditsPerSemester = 15; // Average
        let semestersNeeded = Math.ceil(remainingCredits / creditsPerSemester);

        const currentSemester = this.userProgress.semesters.find(s => s.status === 'current');
        if (!currentSemester) {
            return;
        }

        let currentIndex = this.userProgress.semesters.findIndex(s => s.id === currentSemester.id);
        let graduationIndex = currentIndex + semestersNeeded;

        if (graduationIndex < this.userProgress.semesters.length) {
            const gradSemester = this.userProgress.semesters[graduationIndex];
            this.userProgress.projectedGraduation = `${gradSemester.term} ${gradSemester.year}`;
            document.getElementById('graduationDate').textContent = this.userProgress.projectedGraduation;
        }
    }

    // Show progress message
    showProgressMessage(percentage) {
        if (percentage >= 75) {
            this.showFeedback('success', 'Great progress! You\'re almost there!', 3000);
        } else if (percentage >= 50) {
            this.showFeedback('success', 'You\'re on track! Keep going!', 3000);
        }
    }

    // Show feedback message
    showFeedback(type, message, duration = 3000) {
        const feedbackEl = document.getElementById('feedbackMessage');
        const feedbackText = feedbackEl.querySelector('.feedback-text');
        feedbackText.textContent = message;
        feedbackEl.className = `feedback-message ${type} show`;

        // Only auto-hide success and warning messages (not errors)
        // Error messages stay until user closes them
        if (type === 'error') {
            // Don't auto-hide errors - user must close manually
            return;
        }

        // Auto-hide success and warning messages after duration
        setTimeout(() => {
            this.closeFeedback();
        }, duration);
    }

    // Close feedback message
    closeFeedback() {
        const feedbackEl = document.getElementById('feedbackMessage');
        feedbackEl.classList.remove('show');
    }

    // Filter available courses
    filterAvailableCourses(searchTerm = '', category = 'all') {
        const container = document.getElementById('availableCourses');
        const courses = Array.from(container.children);

        console.log('Filtering courses:', { searchTerm, category, totalCourses: courses.length });

        courses.forEach(course => {
            const courseId = course.dataset.courseId;
            const courseData = courseCatalog[courseId];
            if (!courseData) {
                console.warn('Course data not found for:', courseId);
                return;
            }

            const matchesSearch = !searchTerm || 
                courseData.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courseData.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = category === 'all' || courseData.category === category;

            const shouldShow = matchesSearch && matchesCategory;
            course.style.display = shouldShow ? 'block' : 'none';
            
            console.log(`Course ${courseData.code}:`, {
                category: courseData.category,
                matchesCategory,
                matchesSearch,
                shouldShow
            });
        });
    }

    // Check for unassigned transfer credits
    checkTransferCredits() {
        const unassigned = this.userProgress.transferCredits.filter(tc => !tc.mapped);
        if (unassigned.length > 0) {
            const banner = document.getElementById('transferBanner');
            const bannerText = document.getElementById('transferBannerText');
            bannerText.textContent = `${unassigned.length} transfer course${unassigned.length > 1 ? 's' : ''} unassigned – review suggested mappings`;
            banner.style.display = 'flex';
        }
    }

    // Open transfer credit modal
    openTransferModal() {
        const modal = document.getElementById('transferModal');
        const container = document.getElementById('transferCreditsList');
        container.innerHTML = '';

        this.userProgress.transferCredits.forEach(transfer => {
            const item = document.createElement('div');
            item.className = `transfer-credit-item ${transfer.status}`;
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${transfer.externalCourse}</strong>
                        <div style="color: var(--color-text-light); font-size: 0.9em;">
                            → ${courseCatalog[transfer.uicEquivalent]?.code || transfer.uicEquivalent} 
                            (${transfer.status === 'approved' ? 'Approved' : 'Pending'})
                        </div>
                    </div>
                    ${!transfer.mapped ? 
                        `<button class="btn-transfer" onclick="app.mapTransferCredit('${transfer.id}')">Map to Roadmap</button>` : 
                        '<span style="color: var(--color-success);">✓ Mapped</span>'}
                </div>
            `;
            container.appendChild(item);
        });

        modal.classList.add('show');
    }

    // Close transfer credit modal
    closeTransferModal() {
        document.getElementById('transferModal').classList.remove('show');
    }

    // Map transfer credit to roadmap
    mapTransferCredit(transferId) {
        const transfer = this.userProgress.transferCredits.find(t => t.id === transferId);
        if (!transfer || transfer.mapped) return;

        // Find first available semester
        const firstSemester = this.userProgress.semesters.find(s => s.status === 'planned');
        if (firstSemester) {
            transfer.mapped = true;
            this.addCourseToSemester(transfer.uicEquivalent, firstSemester.id);
            this.showFeedback('success', `${transfer.externalCourse} mapped to ${firstSemester.term} ${firstSemester.year}`);
            this.closeTransferModal();
            this.updateProgress();
            this.renderRoadmap();
            this.checkTransferCredits();
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GradPathApp();
});

