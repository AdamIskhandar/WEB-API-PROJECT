-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 04, 2026 at 06:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `exam_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `credit_hours` tinyint(3) UNSIGNED NOT NULL CHECK (`credit_hours` between 1 and 6),
  `faculty_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `credit_hours`, `faculty_id`, `user_id`) VALUES
(1, 'CS101', 'Introduction to Programming', 3, 1, 2),
(2, 'CS205', 'Database Systems', 4, 1, 2),
(3, 'EE210', 'Digital Electronics', 3, 2, 3),
(4, 'BM301', 'Financial Management', 3, 3, 2),
(5, 'CS310', 'Web Application Development', 4, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `examinations`
--

CREATE TABLE `examinations` (
  `exam_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `venue_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL
) ;

--
-- Dumping data for table `examinations`
--

INSERT INTO `examinations` (`exam_id`, `course_id`, `exam_date`, `start_time`, `end_time`, `venue_id`, `created_by`) VALUES
(1, 1, '2026-01-20', '09:00:00', '11:00:00', 2, 1),
(2, 2, '2026-01-14', '14:00:00', '16:00:00', 2, 1),
(3, 3, '2026-01-15', '09:00:00', '11:30:00', 4, 1),
(4, 5, '2026-01-16', '09:00:00', '12:00:00', 3, 1),
(5, 1, '2026-06-20', '09:00:00', '11:00:00', 1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `examination_venues`
--

CREATE TABLE `examination_venues` (
  `venue_id` int(11) NOT NULL,
  `venue_name` varchar(100) NOT NULL,
  `capacity` int(10) UNSIGNED NOT NULL,
  `location` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `examination_venues`
--

INSERT INTO `examination_venues` (`venue_id`, `venue_name`, `capacity`, `location`) VALUES
(1, 'Exam Hall A', 200, 'Main Building, Level 1'),
(2, 'Main Hall A', 250, 'Block A, Level 1'),
(3, 'Computer Lab 3', 40, 'IT Block, Level 3'),
(4, 'Lecture Theatre 5', 100, 'Science Block, Level 1'),
(5, 'Sports Complex Hall', 500, 'East Campus');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `faculty_id` int(11) NOT NULL,
  `faculty_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`faculty_id`, `faculty_name`) VALUES
(5, 'Faculty of Arts'),
(1, 'Faculty of Computer Science'),
(2, 'Faculty of Engineering'),
(4, 'Faculty of Science'),
(3, 'Faculty of test');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `created_at`, `is_read`) VALUES
(1, 4, 'Exam Schedule Published', 'Your exam timetable for CS101 and CS205 is now available.', '2026-07-03 14:51:15', 0),
(2, 5, 'Result Published', 'Your result for EE210 has been published.', '2026-07-03 14:51:15', 1),
(3, 6, 'Exam Venue Changed', 'The venue for CS310 has been moved to Computer Lab 3.', '2026-07-03 14:51:15', 0),
(4, 4, 'Result Published', 'Your result for CS101 has been published.', '2026-07-03 14:51:15', 0),
(5, 2, 'New Registration', 'A student has registered for CS205.', '2026-07-03 14:51:15', 1),
(6, 1, 'Exam Reminder', 'Your exam starts tomorrow at 9:00 AMMM.', '2026-07-03 19:15:02', 0);

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `result_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) NOT NULL CHECK (`marks_obtained` >= 0 and `marks_obtained` <= 100),
  `grade` varchar(2) NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `results`
--

INSERT INTO `results` (`result_id`, `user_id`, `exam_id`, `marks_obtained`, `grade`, `published_at`) VALUES
(1, 4, 1, 78.50, 'B+', '2026-01-20 02:00:00'),
(2, 4, 2, 85.00, 'A-', '2026-01-22 02:00:00'),
(3, 5, 3, 62.00, 'C+', '2026-01-25 02:00:00'),
(4, 6, 1, 91.00, 'A', '2026-01-20 02:00:00'),
(5, 6, 4, 74.25, 'B', '2026-01-26 02:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `student_course_registration`
--

CREATE TABLE `student_course_registration` (
  `registration_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `registration_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_course_registration`
--

INSERT INTO `student_course_registration` (`registration_id`, `user_id`, `course_id`, `registration_date`) VALUES
(1, 4, 1, '2025-09-01'),
(2, 4, 2, '2025-09-01'),
(3, 5, 3, '2025-09-02'),
(4, 6, 1, '2025-09-01'),
(5, 6, 5, '2025-09-03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Administrator','Lecturer','Student') NOT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `faculty_id`, `created_at`) VALUES
(1, 'Ahmad Rahman', 'ahmad.admin@university.edu', '$2b$12$examplehash0000000000001', 'Administrator', 1, '2026-07-03 14:51:15'),
(2, 'Dr. Siti Aminah', 'siti.lecturer@university.edu', '$2b$12$examplehash0000000000002', 'Lecturer', 1, '2026-07-03 14:51:15'),
(3, 'Dr. John Tan', 'john.tan@university.edu', '$2b$12$examplehash0000000000003', 'Lecturer', 2, '2026-07-03 14:51:15'),
(4, 'Lim Wei Ling', 'weiling.student@university.edu', '$2b$12$examplehash0000000000004', 'Student', 1, '2026-07-03 14:51:15'),
(5, 'Raj Kumar', 'raj.student@university.edu', '$2b$12$examplehash0000000000005', 'Student', 2, '2026-07-03 14:51:15'),
(6, 'Nur Aisyah', 'aisyah.student@university.edu', '$2b$12$examplehash0000000000006', 'Student', 1, '2026-07-03 14:51:15'),
(7, 'Michael Wong', 'michael.admin@university.edu', '$2b$12$examplehash0000000000007', 'Administrator', 3, '2026-07-03 14:51:15'),
(8, 'Adam', 'adam.yusof@university.edu', '$2y$10$7ApAwTIgsdP143VQUOfTmeSqcjF9cprYKHSFxLRxptxJtD.e6EeLq', 'Lecturer', 2, '2026-07-04 14:12:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `course_code` (`course_code`),
  ADD KEY `fk_courses_lecturer` (`user_id`),
  ADD KEY `idx_courses_faculty` (`faculty_id`);

--
-- Indexes for table `examinations`
--
ALTER TABLE `examinations`
  ADD PRIMARY KEY (`exam_id`),
  ADD KEY `fk_exam_venue` (`venue_id`),
  ADD KEY `fk_exam_created_by` (`created_by`),
  ADD KEY `idx_exams_course` (`course_id`);

--
-- Indexes for table `examination_venues`
--
ALTER TABLE `examination_venues`
  ADD PRIMARY KEY (`venue_id`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `faculty_name` (`faculty_name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notifications_user` (`user_id`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`result_id`),
  ADD UNIQUE KEY `uq_student_exam` (`user_id`,`exam_id`),
  ADD KEY `fk_results_exam` (`exam_id`),
  ADD KEY `idx_results_student` (`user_id`);

--
-- Indexes for table `student_course_registration`
--
ALTER TABLE `student_course_registration`
  ADD PRIMARY KEY (`registration_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_faculty` (`faculty_id`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `examinations`
--
ALTER TABLE `examinations`
  MODIFY `exam_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examination_venues`
--
ALTER TABLE `examination_venues`
  MODIFY `venue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_course_registration`
--
ALTER TABLE `student_course_registration`
  MODIFY `registration_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_courses_lecturer` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `examinations`
--
ALTER TABLE `examinations`
  ADD CONSTRAINT `fk_exam_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_exam_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_exam_venue` FOREIGN KEY (`venue_id`) REFERENCES `examination_venues` (`venue_id`) ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `fk_results_exam` FOREIGN KEY (`exam_id`) REFERENCES `examinations` (`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_results_student` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_course_registration`
--
ALTER TABLE `student_course_registration`
  ADD CONSTRAINT `student_course_registration_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `student_course_registration_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
