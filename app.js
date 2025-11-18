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
                        semesterIds: parsed.semesters.map(s => s.id),
                        startSemester: parsed.startSemester
                    });
                    
                    // If startSemester is stored, use it to regenerate semesters if needed
                    if (parsed.startSemester) {
                        const { term, year, includeSummer } = parsed.startSemester;
                        const expectedCount = includeSummer ? 12 : 8;
                        
                        if (parsed.semesters.length !== expectedCount) {
                            const originalSemesters = parsed.semesters;
                            const newSemesters = generateSemesters(year, term, includeSummer || false);
                            
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
                            console.log('Regenerated semesters from startSemester:', {
                                semesterCount: parsed.semesters.length,
                                semesterIds: parsed.semesters.map(s => s.id),
                                includeSummer: includeSummer
                            });
                        }
                    } else if (parsed.semesters.length !== 8 && parsed.semesters.length !== 12) {
                        // Fallback: detect earliest semester from existing courses
                        const earliestSem = this.detectEarliestSemesterFromCourses(parsed.semesters);
                        const hasSummer = parsed.semesters.some(s => s.id.startsWith('Summer'));
                        
                        if (earliestSem) {
                            const match = earliestSem.match(/(\w+)(\d{4})/);
                            if (match) {
                                const term = match[1];
                                const year = parseInt(match[2]);
                                const originalSemesters = parsed.semesters;
                                const newSemesters = generateSemesters(year, term, hasSummer);
                                
                                newSemesters.forEach(newSem => {
                                    const oldSem = originalSemesters.find(os => os.id === newSem.id);
                                    if (oldSem) {
                                        newSem.courses = oldSem.courses || [];
                                        newSem.credits = oldSem.credits || 0;
                                        newSem.status = oldSem.status || newSem.status;
                                    }
                                });
                                parsed.semesters = newSemesters;
                                parsed.startSemester = { term, year, includeSummer: hasSummer };
                            }
                        } else {
                            // Default fallback
                            const originalSemesters = parsed.semesters;
                            const newSemesters = generateSemesters(2025, "Fall", false);
                            newSemesters.forEach(newSem => {
                                const oldSem = originalSemesters.find(os => os.id === newSem.id);
                                if (oldSem) {
                                    newSem.courses = oldSem.courses || [];
                                    newSem.credits = oldSem.credits || 0;
                                    newSem.status = oldSem.status || newSem.status;
                                }
                            });
                            parsed.semesters = newSemesters;
                        }
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
            startSemester: { term: "Fall", year: 2025, includeSummer: false },
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

    detectEarliestSemesterFromCourses(semesters) {
        let earliest = null;
        let earliestYear = Infinity;
        let earliestTermOrder = Infinity;
        
        // Academic year order: Fall comes first, then Winter, Spring, Summer
        const termOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2, 'Summer': 3 };
        
        semesters.forEach(sem => {
            if (sem.courses.length > 0) {
                const match = sem.id.match(/(\w+)(\d{4})/);
                if (match) {
                    const term = match[1];
                    const year = parseInt(match[2]);
                    const termOrd = termOrder[term] !== undefined ? termOrder[term] : 999;
                    
                    if (year < earliestYear || (year === earliestYear && termOrd < earliestTermOrder)) {
                        earliestYear = year;
                        earliestTermOrder = termOrd;
                        earliest = sem.id;
                    }
                }
            }
        });
        
        return earliest;
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

        // Import audit functionality
        document.getElementById('importBtn')?.addEventListener('click', () => {
            document.getElementById('auditFileInput').click();
        });

        document.getElementById('auditFileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleAuditFileUpload(file);
            }
        });

        document.getElementById('closeImportModal')?.addEventListener('click', () => {
            this.closeImportModal();
        });

        document.getElementById('cancelImportBtn')?.addEventListener('click', () => {
            this.closeImportModal();
        });

        document.getElementById('confirmImportBtn')?.addEventListener('click', () => {
            this.confirmImport();
        });

        // Close import modal on outside click
        document.getElementById('importModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'importModal') {
                this.closeImportModal();
            }
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
    // Includes predefined electives plus any math electives taken from audit
    getMathElectives() {
        const predefinedElectives = [
            "MATH215", "MATH218", "MATH220", "MATH320", "MATH430", 
            "MATH435", "MATH436", "MCS421", "MCS423", "MCS471", 
            "STAT401", "STAT473"
        ];
        
        // Add math electives taken from audit (like MATH310, etc.)
        const auditElectives = this.userProgress?.mathElectivesFromAudit || [];
        
        // Combine and remove duplicates
        const allElectives = [...new Set([...predefinedElectives, ...auditElectives])];
        
        return allElectives;
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
    // Includes predefined electives plus any technical electives taken from audit
    getCSElectives() {
        const predefinedElectives = [
            "CS407", "CS411", "CS418", "CS422", "CS440", "CS351"
        ];
        
        // Add technical electives taken from audit
        const takenElectives = this.userProgress.technicalElectivesTaken || [];
        
        // Combine and remove duplicates
        const allElectives = [...new Set([...predefinedElectives, ...takenElectives])];
        
        return allElectives;
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
        
        // Check if this is a gen ed placeholder that has been fulfilled
        const genEdPlaceholders = ['GEN101', 'GEN102', 'GEN103', 'GEN104', 'GEN105', 'GEN106', 'GEN107'];
        if (genEdPlaceholders.includes(courseId)) {
            const genEdMappings = this.userProgress.genEdMappings || {};
            // Hide placeholder if it has been mapped to an actual course
            if (genEdMappings[courseId]) {
                console.log(`Hiding ${course.code} because gen ed requirement has been fulfilled with ${genEdMappings[courseId]}`);
                return true;
            }
        }
        
        // Check if this is a free elective placeholder
        const freeElectivePlaceholders = ['FREE001', 'FREE002', 'FREE003'];
        if (freeElectivePlaceholders.includes(courseId)) {
            const graduationRequirement = 128;
            const totalCredits = this.userProgress.totalCredits || 0;
            const remainingCredits = graduationRequirement - totalCredits;
            
            // If graduation requirement is already met, hide all free elective placeholders
            if (remainingCredits <= 0) {
                console.log(`Hiding ${course.code} because graduation requirement (128 credits) is already met`);
                return true;
            }
            
            // Calculate how many free elective credits are needed (max 9 credits = 3 courses)
            const freeElectiveCreditsNeeded = Math.min(remainingCredits, 9);
            const freeElectiveCoursesNeeded = Math.ceil(freeElectiveCreditsNeeded / 3); // Each placeholder is 3 credits
            
            // Count how many free elective placeholders are currently scheduled
            const scheduledCourses = this.getAllScheduledCourses();
            const scheduledFreeElectives = freeElectivePlaceholders.filter(id => scheduledCourses.includes(id));
            const scheduledFreeElectiveCount = scheduledFreeElectives.length;
            
            // Get the index of this placeholder (0, 1, or 2)
            const placeholderIndex = freeElectivePlaceholders.indexOf(courseId);
            
            // Hide if we already have enough free electives scheduled
            if (scheduledFreeElectiveCount >= freeElectiveCoursesNeeded) {
                console.log(`Hiding ${course.code} because ${scheduledFreeElectiveCount} free elective(s) are already scheduled (need ${freeElectiveCoursesNeeded})`);
                return true;
            }
            
            // Hide if this specific placeholder index is beyond what's needed
            if (placeholderIndex >= freeElectiveCoursesNeeded) {
                console.log(`Hiding ${course.code} because only ${freeElectiveCoursesNeeded} free elective(s) are needed (this is placeholder ${placeholderIndex + 1})`);
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
            
            // If adding a new course (not moving), check if adding it would exceed the limit
            const wouldExceedLimit = !isAlreadyScheduled && currentCourseCount >= 3;
            
            console.log(`Math elective validation for ${course.code}:`, {
                courseId,
                isAlreadyScheduled,
                currentCourseCount,
                wouldExceedLimit,
                maxCourses: 3,
                isRequiredStat: requiredStats.includes(courseId),
                isMathElective: mathElectives.includes(courseId)
            });
            
            // Check if adding this course would exceed 3 math elective courses total
            // Allow up to 3 courses total (including required statistics)
            // If the course is already scheduled, we're moving it, so allow it (count excludes it, so it's fine)
            // If the course is NOT already scheduled, we're adding a new one, so check the limit strictly
            if (!isAlreadyScheduled) {
                // Adding a new course - check if we already have 3
                if (currentCourseCount >= 3) {
                    console.error(`BLOCKING: Trying to add 4th math elective. Current count: ${currentCourseCount}, trying to add: ${course.code}`);
                    return {
                        valid: false,
                        reason: `Cannot add more than 3 math elective courses (including required statistics). You currently have ${currentCourseCount} courses selected.`
                    };
                }
            }
            // If isAlreadyScheduled is true, we're moving an existing course, so allow it
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
        const graduationRequirement = 128;
        const totalCredits = this.userProgress.totalCredits || 0;
        const remainingCredits = graduationRequirement - totalCredits;
        
        // If graduation requirement is already met, show the last semester with courses
        if (remainingCredits <= 0) {
            const semestersWithCourses = this.userProgress.semesters.filter(s => s.courses.length > 0);
            if (semestersWithCourses.length > 0) {
                const lastSemester = semestersWithCourses[semestersWithCourses.length - 1];
                this.userProgress.projectedGraduation = `${lastSemester.term} ${lastSemester.year}`;
                document.getElementById('graduationDate').textContent = this.userProgress.projectedGraduation;
            } else {
                this.userProgress.projectedGraduation = "Complete";
                document.getElementById('graduationDate').textContent = "Complete";
            }
            return;
        }
        
        // Calculate average credits per semester from planned semesters
        let creditsPerSemester = 15; // Default average
        const plannedSemesters = this.userProgress.semesters.filter(s => 
            s.status === "current" || s.status === "planned" || s.status === "in-progress"
        );
        
        if (plannedSemesters.length > 0) {
            const totalPlannedCredits = plannedSemesters.reduce((sum, sem) => sum + (sem.credits || 0), 0);
            if (totalPlannedCredits > 0) {
                creditsPerSemester = totalPlannedCredits / plannedSemesters.length;
            }
        }
        
        // Calculate semesters needed
        let semestersNeeded = Math.ceil(remainingCredits / creditsPerSemester);

        // Find current semester
        const currentSemester = this.userProgress.semesters.find(s => 
            s.status === 'current' || s.status === 'in-progress'
        );
        
        if (!currentSemester) {
            // If no current semester, try to find the first planned semester
            const firstPlanned = this.userProgress.semesters.find(s => s.status === 'planned');
            if (!firstPlanned) {
                this.userProgress.projectedGraduation = "Unknown";
                document.getElementById('graduationDate').textContent = "Unknown";
                return;
            }
            // Use first planned semester as starting point
            const firstIndex = this.userProgress.semesters.findIndex(s => s.id === firstPlanned.id);
            let graduationIndex = firstIndex + semestersNeeded - 1;
            
            if (graduationIndex < this.userProgress.semesters.length) {
                const gradSemester = this.userProgress.semesters[graduationIndex];
                this.userProgress.projectedGraduation = `${gradSemester.term} ${gradSemester.year}`;
                document.getElementById('graduationDate').textContent = this.userProgress.projectedGraduation;
            } else {
                // Calculate beyond existing semesters
                this.calculateGraduationBeyondSemesters(firstPlanned, semestersNeeded - (this.userProgress.semesters.length - firstIndex));
            }
            return;
        }

        let currentIndex = this.userProgress.semesters.findIndex(s => s.id === currentSemester.id);
        
        // Check if we can find graduation within existing semesters by accumulating credits
        let creditsAccumulated = 0;
        let graduationIndex = -1;
        
        for (let i = currentIndex; i < this.userProgress.semesters.length; i++) {
            const sem = this.userProgress.semesters[i];
            creditsAccumulated += sem.credits || 0;
            if (totalCredits + creditsAccumulated >= graduationRequirement) {
                graduationIndex = i;
                break;
            }
        }

        if (graduationIndex !== -1) {
            // Found graduation within existing semesters
            const gradSemester = this.userProgress.semesters[graduationIndex];
            this.userProgress.projectedGraduation = `${gradSemester.term} ${gradSemester.year}`;
            document.getElementById('graduationDate').textContent = this.userProgress.projectedGraduation;
        } else {
            // Need to calculate beyond current semesters
            const creditsInExisting = this.userProgress.semesters
                .slice(currentIndex)
                .reduce((sum, sem) => sum + (sem.credits || 0), 0);
            const creditsStillNeeded = remainingCredits - creditsInExisting;
            const additionalSemestersNeeded = Math.ceil(creditsStillNeeded / creditsPerSemester);
            this.calculateGraduationBeyondSemesters(currentSemester, additionalSemestersNeeded);
        }
    }
    
    // Helper function to calculate graduation date beyond existing semesters
    calculateGraduationBeyondSemesters(startSemester, additionalSemestersNeeded) {
        const hasSummer = this.userProgress.semesters.some(s => s.id.startsWith('Summer'));
        const actualTerms = hasSummer ? ["Fall", "Spring", "Summer"] : ["Fall", "Spring"];
        
        let currentYear = startSemester.year;
        let currentTermIndex = actualTerms.indexOf(startSemester.term);
        if (currentTermIndex === -1) currentTermIndex = 0;
        
        for (let i = 0; i < additionalSemestersNeeded; i++) {
            currentTermIndex = (currentTermIndex + 1) % actualTerms.length;
            if (currentTermIndex === 0) {
                currentYear++;
            }
        }
        
        const gradTerm = actualTerms[currentTermIndex];
        this.userProgress.projectedGraduation = `${gradTerm} ${currentYear}`;
        document.getElementById('graduationDate').textContent = this.userProgress.projectedGraduation;
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

    // Import degree audit functions
    handleAuditFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const htmlContent = e.target.result;
            this.parseAuditHTML(htmlContent);
        };
        reader.onerror = () => {
            this.showFeedback('error', 'Error reading file. Please try again.');
        };
        reader.readAsText(file);
    }

    parseAuditHTML(htmlContent) {
        try {
            // Parse HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');

            // Map gen ed requirement names to categories
            // Note: HTML uses encoded ampersands (&amp;) which get parsed as & by DOMParser
            const genEdCategoryMap = {
                'THEPAST': 'Understanding the Past',
                'WORLDCULT': 'Exploring World Cultures',
                'INDV&SOC': 'Understanding the Individual and Society', // DOMParser converts &amp; to &
                'USSOCIETY': 'Understanding U.S. Society',
                'CRTVARTS': 'Understanding the Creative Arts',
                'HM/SS/ART': 'Additional General Education Electives' // 6 hours in humanities/social sciences/arts
            };

            // Map math elective requirement name
            const mathElectiveReqName = 'CS MATH'; // "Math Electives - CS Major"

            // First, identify gen ed courses and their categories
            const genEdCoursesByCategory = {};
            Object.keys(genEdCategoryMap).forEach(reqName => {
                // Try both the direct name and HTML-encoded version
                let requirement = doc.querySelector(`.requirement[rname="${reqName}"]`);
                if (!requirement && reqName.includes('&')) {
                    // Try HTML-encoded version
                    const encodedName = reqName.replace(/&/g, '&amp;');
                    requirement = doc.querySelector(`.requirement[rname="${encodedName}"]`);
                }
                if (requirement) {
                    const courseTables = requirement.querySelectorAll('table.completedCourses');
                    courseTables.forEach(table => {
                        const courseRows = table.querySelectorAll('tr.takenCourse');
                        courseRows.forEach(row => {
                            const termCell = row.querySelector('.term');
                            const courseCell = row.querySelector('.course');
                            const gradeCell = row.querySelector('.grade');
                            const creditCell = row.querySelector('.credit');
                            const descCell = row.querySelector('.description');
                            
                            if (courseCell && termCell) {
                                const courseCode = courseCell.textContent.trim();
                                const grade = gradeCell ? gradeCell.textContent.trim() : '';
                                const termCode = termCell.textContent.trim();
                                
                                // Skip withdrawn courses
                                if (grade.toUpperCase() === 'W' || grade.toUpperCase().startsWith('W')) {
                                    return;
                                }
                                
                                // Get course name from description
                                let courseName = null;
                                if (descCell) {
                                    const descLines = descCell.querySelectorAll('.descLine');
                                    if (descLines.length > 0) {
                                        courseName = Array.from(descLines).pop().textContent.trim();
                                    }
                                }
                                
                                const normalizedCode = courseCode.replace(/\s+/g, '');
                                const semesterId = this.convertTermCodeToSemesterId(termCode);
                                
                                if (!genEdCoursesByCategory[genEdCategoryMap[reqName]]) {
                                    genEdCoursesByCategory[genEdCategoryMap[reqName]] = [];
                                }
                                
                                // Store course with semester info
                                const courseData = {
                                    courseId: normalizedCode,
                                    semesterId: semesterId,
                                    originalCode: courseCode,
                                    name: courseName,
                                    credits: creditCell ? parseFloat(creditCell.textContent.trim()) : 3
                                };
                                const category = genEdCategoryMap[reqName];
                                genEdCoursesByCategory[category].push(courseData);
                                console.log(`Found gen ed course: ${normalizedCode} (${category}) in ${semesterId}`);
                            }
                        });
                    });
                }
            });

            // Store gen ed mapping for later use
            this.genEdCoursesByCategory = genEdCoursesByCategory;
            console.log('Gen Ed courses by category:', genEdCoursesByCategory);

            // Parse math electives from the audit
            const mathElectiveCourses = new Set();
            const mathElectiveRequirement = doc.querySelector(`.requirement[rname="${mathElectiveReqName}"]`);
            if (mathElectiveRequirement) {
                const courseTables = mathElectiveRequirement.querySelectorAll('table.completedCourses');
                courseTables.forEach(table => {
                    const courseRows = table.querySelectorAll('tr.takenCourse');
                    courseRows.forEach(row => {
                        const courseCell = row.querySelector('.course');
                        const gradeCell = row.querySelector('.grade');
                        if (courseCell) {
                            const courseCode = courseCell.textContent.trim();
                            const grade = gradeCell ? gradeCell.textContent.trim() : '';
                            
                            // Skip withdrawn courses
                            if (grade.toUpperCase() === 'W' || grade.toUpperCase().startsWith('W')) {
                                return;
                            }
                            
                            const normalizedCode = courseCode.replace(/\s+/g, '');
                            mathElectiveCourses.add(normalizedCode);
                            console.log(`Found math elective from audit: ${normalizedCode}`);
                        }
                    });
                });
            }
            
            // Store math electives found in audit for later use
            this.mathElectivesFromAudit = Array.from(mathElectiveCourses);
            console.log('Math electives found in audit:', this.mathElectivesFromAudit);

            // First, identify courses that don't apply toward the degree
            const excludedCourses = new Set();
            
            // Find requirement sections that contain courses that don't apply
            // Check both .reqHeader and .reqTitle elements
            const reqHeaders = doc.querySelectorAll('.reqHeader, .reqTitle');
            reqHeaders.forEach(header => {
                const headerText = header.textContent.trim();
                // Check for various patterns that indicate courses don't apply
                if (headerText.includes('do not apply toward a degree') || 
                    headerText.includes('do not apply to the degree') ||
                    headerText.includes('The following courses do not apply toward a degree in the College of Engineering') ||
                    headerText.includes('UIC courses with W grades and do not apply to the degree') ||
                    headerText.includes('Transfer courses not awarded credit toward this degree') ||
                    headerText.includes('Transfer courses not awarded credit toward the degree') ||
                    headerText.includes('as determined by the College of Engineering') ||
                    headerText.includes('not applicable toward this degree') ||
                    headerText.includes('not applicable toward a degree') ||
                    headerText.includes('do not apply toward') ||
                    headerText.includes('not awarded credit toward') ||
                    headerText.includes('not count toward') ||
                    headerText.includes('not count towards')) {
                    // Find the parent requirement element
                    const requirement = header.closest('.requirement');
                    if (requirement) {
                        console.log(`Found exclusion requirement section: "${headerText.substring(0, 100)}"`);
                        // Find all course tables in this requirement and all subrequirements
                        const excludedTables = requirement.querySelectorAll('table.completedCourses');
                        excludedTables.forEach(table => {
                            const courseRows = table.querySelectorAll('tr.takenCourse');
                            courseRows.forEach(row => {
                                const courseCell = row.querySelector('.course');
                                const gradeCell = row.querySelector('.grade');
                                if (courseCell) {
                                    const courseCode = courseCell.textContent.trim();
                                    const grade = gradeCell ? gradeCell.textContent.trim() : '';
                                    // Skip withdrawn courses (they're already handled separately)
                                    if (grade.toUpperCase() === 'W' || grade.toUpperCase().startsWith('W')) {
                                        return;
                                    }
                                    const normalizedCode = courseCode.replace(/\s+/g, '');
                                    excludedCourses.add(normalizedCode);
                                    console.log(`Excluding course that doesn't apply: ${normalizedCode} (from section: "${headerText.substring(0, 50)}")`);
                                }
                            });
                        });
                    }
                }
            });
            
            // Also check for specific requirement names that indicate exclusion
            const exclusionReqNames = ['W GRADES', 'OTHER', 'OTHERCRS', 'NON BACC'];
            exclusionReqNames.forEach(reqName => {
                const requirement = doc.querySelector(`.requirement[rname="${reqName}"]`);
                if (requirement) {
                    console.log(`Found exclusion requirement by name: ${reqName}`);
                    const excludedTables = requirement.querySelectorAll('table.completedCourses');
                    excludedTables.forEach(table => {
                        const courseRows = table.querySelectorAll('tr.takenCourse');
                        courseRows.forEach(row => {
                            const courseCell = row.querySelector('.course');
                            const gradeCell = row.querySelector('.grade');
                            if (courseCell) {
                                const courseCode = courseCell.textContent.trim();
                                const grade = gradeCell ? gradeCell.textContent.trim() : '';
                                // Skip withdrawn courses (they're already handled separately)
                                if (grade.toUpperCase() === 'W' || grade.toUpperCase().startsWith('W')) {
                                    return;
                                }
                                const normalizedCode = courseCode.replace(/\s+/g, '');
                                excludedCourses.add(normalizedCode);
                                console.log(`Excluding course from ${reqName} section: ${normalizedCode}`);
                            }
                        });
                    });
                }
            });
            
            // Also exclude special course codes that indicate non-credit or non-transfer courses
            const specialExclusionCodes = ['NOTRANSFER', 'NO TRANSFER', 'NONBACC', 'NON BACC'];
            specialExclusionCodes.forEach(code => {
                const normalizedCode = code.replace(/\s+/g, '');
                excludedCourses.add(normalizedCode);
                console.log(`Excluding special course code: ${normalizedCode}`);
            });
            
            console.log(`Found ${excludedCourses.size} courses to exclude:`, Array.from(excludedCourses));

            // Find all course tables
            const courseTables = doc.querySelectorAll('table.completedCourses');
            const coursesBySemester = {};

            // Extract all courses
            courseTables.forEach(table => {
                const courseRows = table.querySelectorAll('tr.takenCourse');
                courseRows.forEach(row => {
                    const termCell = row.querySelector('.term');
                    const courseCell = row.querySelector('.course');
                    const creditCell = row.querySelector('.credit');
                    const gradeCell = row.querySelector('.grade');

                    if (termCell && courseCell && creditCell) {
                        const termCode = termCell.textContent.trim();
                        const courseCode = courseCell.textContent.trim();
                        const credits = parseFloat(creditCell.textContent.trim());
                        const grade = gradeCell ? gradeCell.textContent.trim() : '';

                        // Skip invalid entries
                        if (!termCode || !courseCode || isNaN(credits)) {
                            return;
                        }

                        // Skip courses with "W" grade (withdrawn)
                        if (grade.toUpperCase() === 'W' || grade.toUpperCase().startsWith('W')) {
                            console.log(`Skipping withdrawn course: ${courseCode} (Grade: ${grade})`);
                            return;
                        }

                        // Try to get course name from description cell
                        const descCell = row.querySelector('.description');
                        let courseName = null;
                        if (descCell) {
                            const descLine = descCell.querySelector('.descLine');
                            if (descLine) {
                                // Get the last line which is usually the course name
                                const descLines = descCell.querySelectorAll('.descLine');
                                if (descLines.length > 0) {
                                    // Usually the course name is the last line (not transfer info)
                                    courseName = Array.from(descLines).pop().textContent.trim();
                                }
                            }
                        }

                        // Normalize course code (remove spaces: "MATH 180" -> "MATH180")
                        const normalizedCourseCode = courseCode.replace(/\s+/g, '');

                        // Skip courses that don't apply toward the degree
                        if (excludedCourses.has(normalizedCourseCode)) {
                            console.log(`Skipping course that doesn't apply: ${courseCode} (normalized: ${normalizedCourseCode})`);
                            return;
                        }
                        
                        // Also check if the course code itself indicates it shouldn't be included
                        // (e.g., "NO TRANSFER", "NON BACC", etc.)
                        const upperCourseCode = courseCode.toUpperCase();
                        if (upperCourseCode.includes('NO TRANSFER') || 
                            upperCourseCode.includes('NOTRANSFER') ||
                            upperCourseCode.includes('NON BACC') ||
                            upperCourseCode.includes('NONBACC') ||
                            upperCourseCode === 'NO TRANSFER' ||
                            upperCourseCode === 'NOTRANSFER') {
                            console.log(`Skipping special exclusion course code: ${courseCode}`);
                            return;
                        }

                        // Convert term code to semester ID
                        const semesterId = this.convertTermCodeToSemesterId(termCode);
                        if (!semesterId) {
                            console.warn(`Could not convert term code: ${termCode}`);
                            return;
                        }

                        // Group courses by semester
                        if (!coursesBySemester[semesterId]) {
                            coursesBySemester[semesterId] = [];
                        }

                        // Avoid duplicates
                        const existing = coursesBySemester[semesterId].find(c => c.code === normalizedCourseCode);
                        if (!existing) {
                            coursesBySemester[semesterId].push({
                                code: normalizedCourseCode,
                                originalCode: courseCode,
                                credits: credits,
                                name: courseName
                            });
                        }
                    }
                });
            });

            // Store parsed data for preview
            this.pendingImport = coursesBySemester;
            console.log('Parsed semesters from audit:', Object.keys(coursesBySemester));
            console.log('Courses by semester:', coursesBySemester);
            
            // Debug: Check specifically for Spring 2023
            if (coursesBySemester['Spring2023']) {
                console.log('Spring2023 courses found:', coursesBySemester['Spring2023']);
            } else {
                console.warn('Spring2023 NOT found in parsed courses. Available semesters:', Object.keys(coursesBySemester));
            }
            
            this.showImportPreview(coursesBySemester);

        } catch (error) {
            console.error('Error parsing audit HTML:', error);
            this.showFeedback('error', 'Error parsing degree audit. Please check the file format.');
        }
    }

    convertTermCodeToSemesterId(termCode) {
        // Term code format: FA22, WS24, SU23
        // Semester ID format: Fall2022, Spring2024, Summer2023
        
        if (!termCode || termCode.length < 4) {
            return null;
        }

        const prefix = termCode.substring(0, 2).toUpperCase();
        const yearCode = termCode.substring(2, 4);
        
        // Convert 2-digit year to 4-digit year
        // Assuming years 20-99 are 2000s, 00-19 are 2000s (adjust if needed)
        let fullYear = 2000 + parseInt(yearCode);
        if (fullYear > 2050) {
            fullYear = 1900 + parseInt(yearCode);
        }

        // Map term prefixes
        let term;
        if (prefix === 'FA') {
            term = 'Fall';
        } else if (prefix === 'WS' || prefix === 'SP') {
            term = 'Spring';
        } else if (prefix === 'SU') {
            term = 'Summer';
        } else if (prefix === 'WI') {
            term = 'Winter';
        } else {
            console.warn(`Unknown term prefix: ${prefix}`);
            return null;
        }

        return `${term}${fullYear}`;
    }

    showImportPreview(coursesBySemester) {
        const previewContainer = document.getElementById('importPreview');
        const actionsContainer = document.getElementById('importActions');
        
        // Count totals
        let totalCourses = 0;
        let matchedCourses = 0;
        let unmatchedCourses = 0;
        const unmatchedList = [];

        // Helper function to check if a course will be imported (either in catalog or will be auto-added)
        const willBeImported = (course) => {
            // Check if already in catalog
            if (courseCatalog[course.code]) {
                return true;
            }
            
            // Check if it's a technical elective (CS 300-499) that will be auto-added
            const csMatch = course.code.match(/^CS\s*(\d+)$/);
            if (csMatch) {
                const courseNumber = parseInt(csMatch[1]);
                if (courseNumber >= 300 && courseNumber < 500) {
                    return true; // Will be auto-added as technical elective
                }
            }
            
            // Check if it's a gen ed course that was found in gen ed sections
            if (this.genEdCoursesByCategory) {
                for (const category in this.genEdCoursesByCategory) {
                    const coursesInCategory = this.genEdCoursesByCategory[category];
                    if (coursesInCategory.some(c => {
                        const courseId = typeof c === 'string' ? c : c.courseId;
                        return courseId === course.code;
                    })) {
                        return true; // Found in gen ed sections, will be imported
                    }
                }
            }
            
            // Check if it's a course with valid info that will likely be auto-added
            // (has name, credits, and is not excluded)
            if (course.name && course.credits && course.credits > 0) {
                // Likely a valid course that will be added (gen ed, etc.)
                return true;
            }
            
            return false;
        };

        Object.keys(coursesBySemester).forEach(semesterId => {
            coursesBySemester[semesterId].forEach(course => {
                totalCourses++;
                if (willBeImported(course)) {
                    matchedCourses++;
                } else {
                    unmatchedCourses++;
                    unmatchedList.push(course.originalCode);
                }
            });
        });

        // Build preview HTML
        let previewHTML = '<div style="max-height: 400px; overflow-y: auto;">';
        previewHTML += `<h3>Import Preview</h3>`;
        previewHTML += `<p><strong>Total courses found:</strong> ${totalCourses}</p>`;
        previewHTML += `<p><strong>Matched courses:</strong> ${matchedCourses} (will be imported)</p>`;
        
        if (unmatchedCourses > 0) {
            previewHTML += `<p><strong>Unmatched courses:</strong> ${unmatchedCourses} (will be skipped)</p>`;
            previewHTML += `<details style="margin-top: 10px;"><summary>Unmatched courses</summary><ul style="margin-top: 5px;">`;
            unmatchedList.forEach(code => {
                previewHTML += `<li>${code}</li>`;
            });
            previewHTML += `</ul></details>`;
        }

        previewHTML += '<h4 style="margin-top: 20px;">Courses by Semester:</h4>';
        
        // Sort semesters chronologically
        const sortedSemesters = Object.keys(coursesBySemester).sort((a, b) => {
            // Extract year and term for sorting
            const aMatch = a.match(/(\w+)(\d{4})/);
            const bMatch = b.match(/(\w+)(\d{4})/);
            if (!aMatch || !bMatch) return 0;
            
            const aYear = parseInt(aMatch[2]);
            const bYear = parseInt(bMatch[2]);
            if (aYear !== bYear) return aYear - bYear;
            
            // Academic year order: Fall comes first, then Winter, Spring, Summer
            const termOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2, 'Summer': 3 };
            return (termOrder[aMatch[1]] || 0) - (termOrder[bMatch[1]] || 0);
        });

            sortedSemesters.forEach(semesterId => {
                const courses = coursesBySemester[semesterId];
                const matched = courses.filter(c => willBeImported(c));
                
                if (matched.length > 0) {
                    previewHTML += `<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">`;
                    previewHTML += `<strong>${semesterId}:</strong> ${matched.length} course(s)<ul style="margin-top: 5px; margin-left: 20px;">`;
                    matched.forEach(course => {
                        const catalogCourse = courseCatalog[course.code];
                        if (catalogCourse) {
                            previewHTML += `<li>${catalogCourse.code} - ${catalogCourse.name} (${course.credits} credits)</li>`;
                        } else {
                            // Course will be auto-added
                            const displayCode = course.originalCode || course.code.replace(/([A-Z]+)(\d+)/, '$1 $2');
                            const displayName = course.name || `${displayCode} - (will be added to catalog)`;
                            previewHTML += `<li>${displayCode} - ${displayName} (${course.credits} credits)</li>`;
                        }
                    });
                    previewHTML += `</ul></div>`;
                }
            });

        previewHTML += '</div>';
        previewContainer.innerHTML = previewHTML;
        actionsContainer.style.display = 'block';

        // Show modal
        document.getElementById('importModal').classList.add('show');
    }

    confirmImport() {
        if (!this.pendingImport) {
            return;
        }

        // Find the earliest semester from the import
        const earliestSemester = this.findEarliestSemester(this.pendingImport);
        
        // Check if there are any Summer semesters in the import
        const hasSummerSemesters = Object.keys(this.pendingImport).some(semesterId => {
            return semesterId.startsWith('Summer');
        });
        
        if (earliestSemester) {
            // Extract year and term from earliest semester ID (e.g., "Fall2022")
            const match = earliestSemester.match(/(\w+)(\d{4})/);
            if (match) {
                const startTerm = match[1];
                const startYear = parseInt(match[2]);
                
                // Store the start semester info
                this.userProgress.startSemester = {
                    term: startTerm,
                    year: startYear,
                    includeSummer: hasSummerSemesters
                };
                
                // Regenerate semesters starting from the earliest semester
                const existingCoursesBySemester = {};
                this.userProgress.semesters.forEach(sem => {
                    if (sem.courses.length > 0) {
                        existingCoursesBySemester[sem.id] = {
                            courses: [...sem.courses],
                            credits: sem.credits,
                            status: sem.status
                        };
                    }
                });
                
                // Generate semesters based on what's actually in the audit, not a fixed pattern
                const newSemesters = this.generateSemestersFromAudit(this.pendingImport, startYear, startTerm, hasSummerSemesters);
                
                // Preserve existing courses and merge with imported courses
                newSemesters.forEach(sem => {
                    // Restore existing courses if any
                    if (existingCoursesBySemester[sem.id]) {
                        sem.courses = existingCoursesBySemester[sem.id].courses;
                        sem.credits = existingCoursesBySemester[sem.id].credits;
                        sem.status = existingCoursesBySemester[sem.id].status;
                    }
                    
                    // Add imported courses for this semester
                    if (this.pendingImport[sem.id]) {
                        console.log(`Adding courses to ${sem.id}:`, this.pendingImport[sem.id].map(c => c.code));
                        this.pendingImport[sem.id].forEach(course => {
                            // Check if course exists in catalog, if not, try to add it
                            if (!courseCatalog[course.code]) {
                                // Try to add missing course to catalog (for technical electives)
                                this.addMissingCourseToCatalog(course);
                            }
                            
                            if (courseCatalog[course.code]) {
                                if (!sem.courses.includes(course.code)) {
                                    sem.courses.push(course.code);
                                    sem.credits += course.credits;
                                    console.log(`Added ${course.code} to ${sem.id}`);
                                } else {
                                    console.log(`Course ${course.code} already in ${sem.id}`);
                                }
                            } else {
                                console.warn(`Course ${course.code} not found in catalog, skipping`);
                                
                                // Check if it's a math elective from the audit
                                const isMathElective = this.mathElectivesFromAudit && this.mathElectivesFromAudit.includes(course.code);
                                
                                // For gen ed courses or math electives, add them to catalog if they're not there
                                if (course.name) {
                                    const originalCode = course.originalCode || course.code.replace(/([A-Z]+)(\d+)/, '$1 $2');
                                    // Determine category: math elective if found in audit, otherwise general
                                    const category = isMathElective ? "math" : "general";
                                    
                                    courseCatalog[course.code] = {
                                        id: course.code,
                                        code: originalCode,
                                        name: course.name,
                                        credits: course.credits || 3,
                                        prerequisites: [],
                                        offeredIn: ["Fall", "Spring"],
                                        category: category,
                                        description: isMathElective ? `Math elective course - ${course.name}` : `General education course - ${course.name}`
                                    };
                                    console.log(`Auto-added ${course.code} to catalog: ${course.name} (category: ${category})`);
                                    // Now add it to the semester
                                    if (!sem.courses.includes(course.code)) {
                                        sem.courses.push(course.code);
                                        sem.credits += course.credits;
                                        console.log(`Added ${course.code} to ${sem.id} after auto-adding to catalog`);
                                    }
                                }
                            }
                        });
                    } else {
                        console.log(`No courses found in pendingImport for ${sem.id}`);
                    }
                });
                
                // Handle Winter semesters that don't match Fall/Spring/Summer
                // Map Winter courses to Spring of the same year
                Object.keys(this.pendingImport).forEach(semesterId => {
                    const match = semesterId.match(/(\w+)(\d{4})/);
                    if (match) {
                        const term = match[1];
                        const year = parseInt(match[2]);
                        
                        if (term === 'Winter') {
                            const springSemesterId = `Spring${year}`;
                            const springSem = newSemesters.find(s => s.id === springSemesterId);
                            if (springSem && this.pendingImport[semesterId]) {
                                this.pendingImport[semesterId].forEach(course => {
                                    if (courseCatalog[course.code] && !springSem.courses.includes(course.code)) {
                                        springSem.courses.push(course.code);
                                        springSem.credits += course.credits;
                                    }
                                });
                            }
                        }
                    }
                });
                
                // Filter out semesters with 0 courses, BUT keep the current/in-progress semester even if empty
                const semestersWithCourses = newSemesters.filter(sem => {
                    // Keep semester if it has courses OR if it's marked as current/in-progress
                    const shouldKeep = sem.courses.length > 0 || sem.status === "current" || sem.status === "in-progress";
                    if (!shouldKeep && sem.id === 'Spring2023') {
                        console.warn(`Spring2023 is being filtered out! Courses: ${sem.courses.length}, Status: ${sem.status}`);
                    }
                    return shouldKeep;
                });
                console.log('Filtered semesters (removed empty ones, but kept current):', {
                    before: newSemesters.map(s => `${s.id} (${s.courses.length} courses, ${s.status})`),
                    after: semestersWithCourses.map(s => `${s.id} (${s.courses.length} courses, ${s.status})`)
                });
                
                // Debug: Check if Spring2023 is in the filtered list
                const spring2023InFiltered = semestersWithCourses.find(s => s.id === 'Spring2023');
                if (spring2023InFiltered) {
                    console.log('Spring2023 is in filtered semesters:', spring2023InFiltered);
                } else {
                    console.error('Spring2023 is MISSING from filtered semesters!');
                    console.log('All filtered semesters:', semestersWithCourses.map(s => s.id));
                }
                
                // Update user progress with semesters that have courses or are current
                this.userProgress.semesters = semestersWithCourses;
                console.log('Updated userProgress.semesters:', semestersWithCourses.map(s => s.id));
                
                // Calculate total credits to check if graduation requirement is met
                const totalCredits = semestersWithCourses.reduce((sum, semester) => {
                    return sum + (semester.credits || 0);
                }, 0);
                const graduationRequirement = 128;
                const hasMetGraduationRequirement = totalCredits >= graduationRequirement;
                
                console.log(`Total credits: ${totalCredits}/${graduationRequirement}, hasMetGraduationRequirement: ${hasMetGraduationRequirement}`);
                
                // Set current semester - find the first semester that should be current
                // If no semester is marked as current, mark the first one after the last semester with courses
                let currentSem = semestersWithCourses.find(s => s.status === "current");
                
                if (!currentSem && semestersWithCourses.length > 0) {
                    // Find the last semester with courses
                    const lastSemesterWithCourses = semestersWithCourses.filter(s => s.courses.length > 0).pop();
                    if (lastSemesterWithCourses) {
                        // Mark the next semester after the last one with courses as current
                        const lastIndex = semestersWithCourses.indexOf(lastSemesterWithCourses);
                        if (lastIndex < semestersWithCourses.length - 1) {
                            currentSem = semestersWithCourses[lastIndex + 1];
                        } else {
                            // Only add a new semester for planning if graduation requirement is NOT met
                            if (!hasMetGraduationRequirement) {
                                // If the last semester with courses is the last semester, add a new one for planning
                                const termOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2, 'Summer': 3 };
                                const lastMatch = lastSemesterWithCourses.id.match(/(\w+)(\d{4})/);
                                if (lastMatch) {
                                    const lastTerm = lastMatch[1];
                                    const lastYear = parseInt(lastMatch[2]);
                                    const hasSummer = semestersWithCourses.some(s => s.id.startsWith('Summer'));
                                    const terms = hasSummer ? ["Fall", "Spring", "Summer"] : ["Fall", "Spring"];
                                    const termOrderMap = { "Fall": 0, "Spring": 1, "Summer": 2 };
                                    
                                    let nextYear = lastYear;
                                    let nextTermIndex = termOrderMap[lastTerm] !== undefined ? termOrderMap[lastTerm] : 0;
                                    nextTermIndex = (nextTermIndex + 1) % terms.length;
                                    if (nextTermIndex === 0) {
                                        nextYear++;
                                    }
                                    
                                    const nextSemesterId = `${terms[nextTermIndex]}${nextYear}`;
                                    currentSem = {
                                        id: nextSemesterId,
                                        term: terms[nextTermIndex],
                                        year: nextYear,
                                        courses: [],
                                        credits: 0,
                                        status: "current"
                                    };
                                    semestersWithCourses.push(currentSem);
                                    console.log(`Added future semester ${nextSemesterId} for planning (credits: ${totalCredits}/${graduationRequirement})`);
                                }
                            } else {
                                console.log(`Not adding future semester - graduation requirement met (${totalCredits}/${graduationRequirement} credits)`);
                            }
                        }
                    } else {
                        // If no semesters have courses, mark the first one as current
                        currentSem = semestersWithCourses[0];
                    }
                }
                
                if (currentSem) {
                    this.userProgress.currentSemester = currentSem.id;
                    // Mark the current semester
                    currentSem.status = "current";
                }
                
                // If graduation requirement is met, remove any empty future semesters
                if (hasMetGraduationRequirement) {
                    const lastSemesterWithCourses = semestersWithCourses.filter(s => s.courses.length > 0).pop();
                    if (lastSemesterWithCourses) {
                        const lastIndex = semestersWithCourses.indexOf(lastSemesterWithCourses);
                        // Remove any semesters after the last one with courses
                        if (lastIndex < semestersWithCourses.length - 1) {
                            const semestersToRemove = semestersWithCourses.slice(lastIndex + 1);
                            semestersToRemove.forEach(sem => {
                                console.log(`Removing empty future semester ${sem.id} - graduation requirement met`);
                            });
                            semestersWithCourses.splice(lastIndex + 1);
                            // Update userProgress with the filtered list
                            this.userProgress.semesters = semestersWithCourses;
                        }
                    }
                }
            }
        }

        let importedCount = 0;
        let skippedCount = 0;

        // Count imported courses
        Object.keys(this.pendingImport).forEach(semesterId => {
            this.pendingImport[semesterId].forEach(course => {
                if (courseCatalog[course.code]) {
                    const semester = this.userProgress.semesters.find(s => s.id === semesterId);
                    if (semester && semester.courses.includes(course.code)) {
                        importedCount++;
                    } else {
                        skippedCount++;
                    }
                }
            });
        });

        // Process technical electives - update electives list based on what was taken
        this.updateTechnicalElectivesFromAudit();

        // Process math electives - store math electives found in audit
        if (this.mathElectivesFromAudit) {
            if (!this.userProgress.mathElectivesFromAudit) {
                this.userProgress.mathElectivesFromAudit = [];
            }
            // Merge with existing, avoiding duplicates
            const existing = new Set(this.userProgress.mathElectivesFromAudit);
            this.mathElectivesFromAudit.forEach(courseId => existing.add(courseId));
            this.userProgress.mathElectivesFromAudit = Array.from(existing);
            console.log('Updated math electives from audit:', this.userProgress.mathElectivesFromAudit);
        }

        // Process general education courses - replace placeholders with actual courses
        this.updateGeneralEducationFromAudit();

        // Clean up unused free elective placeholders
        this.cleanupFreeElectivePlaceholders();

        // Clean up math elective placeholders if requirement is met
        this.cleanupMathElectivePlaceholders();

        // Save and refresh
        this.saveUserProgress();
        this.updateProgress();
        this.renderRoadmap();
        
        // Force re-render of available courses to ensure math electives are hidden if requirement is met
        // This ensures shouldHideCourse is called with the updated course count
        this.renderAvailableCourses();
        
        this.closeImportModal();

        // Show feedback
        if (importedCount > 0) {
            let message = `Successfully imported ${importedCount} course(s) from degree audit! Roadmap now starts from ${earliestSemester}.`;
            if (hasSummerSemesters) {
                message += ' Summer semesters have been included in your roadmap.';
            }
            this.showFeedback('success', message);
        } else {
            this.showFeedback('info', 'No new courses were imported. They may already be in your roadmap.');
        }

        // Clear pending import
        this.pendingImport = null;
        
        // Reset file input
        document.getElementById('auditFileInput').value = '';
    }

    findEarliestSemester(coursesBySemester) {
        let earliest = null;
        let earliestYear = Infinity;
        let earliestTermOrder = Infinity;
        
        // Academic year order: Fall comes first, then Winter, Spring, Summer
        const termOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2, 'Summer': 3 };
        
        Object.keys(coursesBySemester).forEach(semesterId => {
            const match = semesterId.match(/(\w+)(\d{4})/);
            if (match) {
                const term = match[1];
                const year = parseInt(match[2]);
                const termOrd = termOrder[term] !== undefined ? termOrder[term] : 999;
                
                if (year < earliestYear || (year === earliestYear && termOrd < earliestTermOrder)) {
                    earliestYear = year;
                    earliestTermOrder = termOrd;
                    earliest = semesterId;
                }
            }
        });
        
        return earliest;
    }

    generateSemestersFromAudit(coursesBySemester, startYear, startTerm, includeSummer) {
        const semesters = [];
        const termOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2, 'Summer': 3 };
        
        // STEP 1: Get ALL unique semester IDs from the audit (these are the ONLY semesters that have courses)
        const auditSemesterIds = Object.keys(coursesBySemester);
        console.log('Semesters found in audit:', auditSemesterIds);
        console.log('CoursesBySemester keys:', Object.keys(coursesBySemester));
        
        // Debug: Check for Spring 2023 specifically
        if (coursesBySemester['Spring2023']) {
            console.log('Spring2023 found in coursesBySemester with', coursesBySemester['Spring2023'].length, 'courses');
        } else {
            console.warn('Spring2023 NOT in coursesBySemester! Available:', Object.keys(coursesBySemester));
        }
        
        // STEP 2: Sort them chronologically
        // Chronological order within a year: Spring, Summer, Fall, Winter
        const chronologicalTermOrder = { 'Spring': 0, 'Summer': 1, 'Fall': 2, 'Winter': 3 };
        
        const sortedAuditSemesters = auditSemesterIds.sort((a, b) => {
            const aMatch = a.match(/(\w+)(\d{4})/);
            const bMatch = b.match(/(\w+)(\d{4})/);
            if (!aMatch || !bMatch) return 0;
            
            const aYear = parseInt(aMatch[2]);
            const bYear = parseInt(bMatch[2]);
            
            // First sort by year
            if (aYear !== bYear) return aYear - bYear;
            
            // Then sort by term order within the same year (Spring, Summer, Fall, Winter)
            const aTermOrd = chronologicalTermOrder[aMatch[1]] !== undefined ? chronologicalTermOrder[aMatch[1]] : 999;
            const bTermOrd = chronologicalTermOrder[bMatch[1]] !== undefined ? chronologicalTermOrder[bMatch[1]] : 999;
            return aTermOrd - bTermOrd;
        });
        
        console.log('Sorted semesters from audit:', sortedAuditSemesters);
        
        // STEP 3: Create semester objects ONLY for semesters that exist in the audit
        // DO NOT create any semesters that aren't in the audit - only show semesters where classes were taken
        sortedAuditSemesters.forEach(semesterId => {
            const match = semesterId.match(/(\w+)(\d{4})/);
            if (match) {
                const term = match[1];
                const year = parseInt(match[2]);
                
                semesters.push({
                    id: semesterId,
                    term: term,
                    year: year,
                    courses: [],
                    credits: 0,
                    status: "planned"
                });
            }
        });
        
        console.log('Created semesters from audit (ONLY semesters with courses):', semesters.map(s => s.id));
        
        // DO NOT add any future semesters - only show semesters where classes were actually taken
        // If user wants to plan future semesters, they can add them manually
        
        return semesters;
    }

    closeImportModal() {
        document.getElementById('importModal').classList.remove('show');
        this.pendingImport = null;
        document.getElementById('auditFileInput').value = '';
    }

    // Add missing course to catalog (for technical electives not in predefined list)
    addMissingCourseToCatalog(course) {
        // Check if it's a CS course (technical elective)
        // Handle both "CS 401" and "CS401" formats
        const courseCodeMatch = course.code.match(/^CS\s*(\d+)$/);
        if (courseCodeMatch) {
            const courseNumber = parseInt(courseCodeMatch[1]);
            // CS 300-499 are technical electives
            if (courseNumber >= 300 && courseNumber < 500) {
                // Normalize course ID (remove spaces)
                const courseId = course.code.replace(/\s+/g, '');
                if (!courseCatalog[courseId]) {
                    // Try to get course name from the audit HTML if available
                    // For now, use a generic name
                    // Use course name from audit if available, otherwise use generic name
                    const courseName = course.name || `${course.code} - Technical Elective`;
                    const courseCodeFormatted = course.code.includes(' ') ? course.code : course.code.replace(/(\d+)/, ' $1');
                    
                    courseCatalog[courseId] = {
                        id: courseId,
                        code: courseCodeFormatted,
                        name: courseName,
                        credits: course.credits,
                        prerequisites: [],
                        offeredIn: ["Fall", "Spring"],
                        category: "elective",
                        description: `Technical elective course - ${course.code}`
                    };
                    console.log(`Added missing technical elective to catalog: ${courseId}`);
                }
            }
        }
    }

    // Update technical electives list based on courses taken from audit
    updateTechnicalElectivesFromAudit() {
        if (!this.pendingImport) return;
        
        // Collect all CS 300-499 level courses from the import
        const technicalElectivesTaken = new Set();
        const allScheduledCourses = this.getAllScheduledCourses();
        
        // Get all CS courses that are 300-499 level
        allScheduledCourses.forEach(courseId => {
            const course = courseCatalog[courseId];
            if (course && course.code.match(/^CS\s*[3-4]\d{2}$/)) {
                const match = course.code.match(/^CS\s*(\d+)$/);
                if (match) {
                    const courseNumber = parseInt(match[1]);
                    if (courseNumber >= 300 && courseNumber < 500) {
                        technicalElectivesTaken.add(courseId);
                    }
                }
            }
        });
        
        // Also check courses from pendingImport that might not be in catalog yet
        Object.values(this.pendingImport).forEach(courses => {
            courses.forEach(course => {
                // Handle both "CS401" and "CS 401" formats
                const courseCodeMatch = course.code.match(/^CS\s*(\d+)$/);
                if (courseCodeMatch) {
                    const courseNumber = parseInt(courseCodeMatch[1]);
                    if (courseNumber >= 300 && courseNumber < 500) {
                        // Normalize course ID
                        const courseId = course.code.replace(/\s+/g, '');
                        if (courseCatalog[courseId]) {
                            technicalElectivesTaken.add(courseId);
                        }
                    }
                }
            });
        });
        
        // Store the list of technical electives taken in userProgress
        // This will be used to dynamically update getCSElectives()
        if (!this.userProgress.technicalElectivesTaken) {
            this.userProgress.technicalElectivesTaken = [];
        }
        
        // Update the list with all technical electives taken
        this.userProgress.technicalElectivesTaken = Array.from(technicalElectivesTaken);
        console.log('Technical electives taken:', this.userProgress.technicalElectivesTaken);
    }

    // Update general education courses - replace placeholders with actual courses taken
    updateGeneralEducationFromAudit() {
        if (!this.genEdCoursesByCategory) return;

        // Map of gen ed category to placeholder course ID(s)
        const genEdPlaceholderMap = {
            'Exploring World Cultures': 'GEN101',
            'Understanding the Creative Arts': 'GEN102',
            'Understanding the Past': 'GEN103',
            'Understanding the Individual and Society': 'GEN104',
            'Understanding U.S. Society': 'GEN105',
            'Additional General Education Electives': ['GEN106', 'GEN107'] // 6 hours = 2 courses
        };

        // Store gen ed course mappings
        if (!this.userProgress.genEdMappings) {
            this.userProgress.genEdMappings = {};
        }

        // For each gen ed category, find the course taken and map it
        Object.keys(this.genEdCoursesByCategory).forEach(category => {
            const coursesTaken = this.genEdCoursesByCategory[category];
            if (coursesTaken && coursesTaken.length > 0) {
                const placeholderIds = genEdPlaceholderMap[category];
                
                // Handle Additional General Education Electives (multiple courses)
                if (category === 'Additional General Education Electives' && Array.isArray(placeholderIds)) {
                    // Map up to 2 courses to GEN106 and GEN107
                    coursesTaken.slice(0, 2).forEach((courseData, index) => {
                        if (index < placeholderIds.length) {
                            const placeholderId = placeholderIds[index];
                            const actualCourseId = typeof courseData === 'string' ? courseData : courseData.courseId;
                            const actualSemesterId = typeof courseData === 'object' ? courseData.semesterId : null;
                            const courseInfo = typeof courseData === 'object' ? courseData : null;
                            
                            this.processGenEdMapping(category, placeholderId, actualCourseId, actualSemesterId, courseInfo);
                        }
                    });
                    return; // Skip the single-course logic below
                }
                
                // Handle single-course gen ed requirements
                const placeholderId = Array.isArray(placeholderIds) ? placeholderIds[0] : placeholderIds;
                if (!placeholderId) return;
                
                // Use the first course taken for this category
                // coursesTaken is now an array of objects with courseId, semesterId, etc.
                const firstCourse = coursesTaken[0];
                const actualCourseId = typeof firstCourse === 'string' ? firstCourse : firstCourse.courseId;
                const actualSemesterId = typeof firstCourse === 'object' ? firstCourse.semesterId : null;
                const courseInfo = typeof firstCourse === 'object' ? firstCourse : null;
                
                if (actualCourseId) {
                    this.processGenEdMapping(category, placeholderId, actualCourseId, actualSemesterId, courseInfo);
                }
            }
        });

        console.log('Gen Ed mappings:', this.userProgress.genEdMappings);
    }

    // Helper method to process a single gen ed mapping
    processGenEdMapping(category, placeholderId, actualCourseId, actualSemesterId, courseInfo) {
        if (!placeholderId || !actualCourseId) return;
                    console.log(`Processing gen ed mapping: ${category} -> ${placeholderId} -> ${actualCourseId}`);
                    
                    // Add the actual course to catalog if not already there
                    if (!courseCatalog[actualCourseId]) {
                        // Use courseInfo from gen ed parsing, or try to find from pendingImport
                        let finalCourseInfo = courseInfo;
                        if (!finalCourseInfo) {
                            Object.values(this.pendingImport || {}).forEach(courses => {
                                const found = courses.find(c => c.code === actualCourseId);
                                if (found) {
                                    finalCourseInfo = found;
                                }
                            });
                        }

                        if (finalCourseInfo) {
                            const originalCode = finalCourseInfo.originalCode || actualCourseId.replace(/([A-Z]+)(\d+)/, '$1 $2');
                            const courseName = finalCourseInfo.name || `${actualCourseId} - General Education`;
                            const credits = finalCourseInfo.credits || 3;
                            
                            courseCatalog[actualCourseId] = {
                                id: actualCourseId,
                                code: originalCode,
                                name: courseName,
                                credits: credits,
                                prerequisites: [],
                                offeredIn: ["Fall", "Spring"],
                                category: "general",
                                description: `${category} requirement - ${courseName}`
                            };
                            console.log(`Added gen ed course to catalog: ${actualCourseId} (${category}) - ${courseName}`);
                        } else {
                            console.warn(`Could not find course info for ${actualCourseId} (${category})`);
                        }
                    } else {
                        console.log(`Gen ed course ${actualCourseId} already in catalog`);
                    }

                    // Store the mapping
                    this.userProgress.genEdMappings[placeholderId] = actualCourseId;
                    console.log(`Mapped ${category}: ${placeholderId} -> ${actualCourseId}`);

                    // Always remove placeholder instances from semesters since the actual course is already there
                    // The actual course should already be in the correct semester from the regular parsing
                    this.userProgress.semesters.forEach(semester => {
                        const placeholderIndex = semester.courses.indexOf(placeholderId);
                        if (placeholderIndex !== -1) {
                            console.log(`Removing placeholder ${placeholderId} from ${semester.id} (replaced with ${actualCourseId})`);
                            semester.courses.splice(placeholderIndex, 1);
                            const placeholderCredits = courseCatalog[placeholderId]?.credits || 3;
                            semester.credits = Math.max(0, semester.credits - placeholderCredits);
                        }
                    });

                    // Ensure the actual course is in the correct semester if it's not already there
                    // Find the semester where this course should be based on the audit
                    if (actualSemesterId) {
                        const targetSemester = this.userProgress.semesters.find(s => s.id === actualSemesterId);
                        if (targetSemester && !targetSemester.courses.includes(actualCourseId)) {
                            // Add the course to the correct semester
                            targetSemester.courses.push(actualCourseId);
                            if (courseCatalog[actualCourseId]) {
                                targetSemester.credits += courseCatalog[actualCourseId].credits;
                            }
                            console.log(`Added ${actualCourseId} to ${actualSemesterId}`);
                        }
                    }
    }

    // Clean up unused free elective placeholders
    cleanupFreeElectivePlaceholders() {
        const freeElectivePlaceholders = ['FREE001', 'FREE002', 'FREE003'];
        const allScheduledCourses = this.getAllScheduledCourses();
        
        // Count how many free elective placeholders are actually in use
        const usedPlaceholders = freeElectivePlaceholders.filter(placeholder => 
            allScheduledCourses.includes(placeholder)
        );
        
        // If there are unused placeholders, remove them from semesters
        // Keep only the ones that are actually scheduled
        freeElectivePlaceholders.forEach(placeholder => {
            if (!allScheduledCourses.includes(placeholder)) {
                // Remove this placeholder from all semesters
                this.userProgress.semesters.forEach(semester => {
                    const placeholderIndex = semester.courses.indexOf(placeholder);
                    if (placeholderIndex !== -1) {
                        console.log(`Removing unused free elective placeholder ${placeholder} from ${semester.id}`);
                        semester.courses.splice(placeholderIndex, 1);
                        const placeholderCredits = courseCatalog[placeholder]?.credits || 3;
                        semester.credits = Math.max(0, semester.credits - placeholderCredits);
                    }
                });
            }
        });
        
        console.log(`Free elective cleanup: ${usedPlaceholders.length} placeholders in use, ${freeElectivePlaceholders.length - usedPlaceholders.length} removed`);
    }

    // Clean up math elective placeholders if requirement is already met
    cleanupMathElectivePlaceholders() {
        const mathElectiveCourseCount = this.getMathElectiveCourseCount();
        
        console.log(`Math elective cleanup: ${mathElectiveCourseCount} courses scheduled (requirement: 3)`);
        
        // If 3 or more math elective courses are already scheduled, ensure math electives are hidden
        // The shouldHideCourse function should handle this, but we'll log it for debugging
        if (mathElectiveCourseCount >= 3) {
            console.log(`Math elective requirement met (${mathElectiveCourseCount} courses). Math electives should be hidden from available courses.`);
        } else {
            console.log(`Math elective requirement not yet met (${mathElectiveCourseCount}/3 courses). Math electives should be visible.`);
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GradPathApp();
});

