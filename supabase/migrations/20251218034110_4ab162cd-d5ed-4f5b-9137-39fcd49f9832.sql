-- Create grades table for tracking student grades
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade_value DECIMAL(5,2) NOT NULL,
  grade_type TEXT NOT NULL DEFAULT 'quiz', -- quiz, exam, assignment, project
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quarter TEXT, -- Q1, Q2, Q3, Q4
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Create policies for grades table
CREATE POLICY "Enable read access for all users" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.grades FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.grades FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();