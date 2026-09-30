import { redirect } from 'next/navigation';

/**
 * Legacy alias kept for existing internal links to /quiz.
 * Canonical quiz route is /skin-quiz.
 */
export default function QuizRedirectPage() {
  redirect('/skin-quiz');
}
