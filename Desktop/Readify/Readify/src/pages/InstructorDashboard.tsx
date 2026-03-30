import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical, DollarSign, Users, BookOpen, Play, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import API from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Course { _id: string; title: string; description: string; thumbnail_url: string; instructor_name: string; category: string; level: string; duration_hours: number; price: number; is_published: boolean; createdAt: string; }
interface Video { _id: string; course: string; title: string; description: string; url: string; duration_minutes: number; order_index: number; }
interface Exam { _id: string; course: string; title: string; description: string; time_limit_minutes: number; questions: any[]; is_published: boolean; }

export function InstructorDashboard() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Video dialog
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [videoForm, setVideoForm] = useState({ course: '', title: '', description: '', url: '', duration_minutes: 0, order_index: 0 });

    // Exam dialog
    const [examDialogOpen, setExamDialogOpen] = useState(false);
    const [examForm, setExamForm] = useState({
        course: '', title: '', description: '', time_limit_minutes: 15, is_published: false,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });

    // Student results
    const [examResults, setExamResults] = useState<any[]>([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [allExams, setAllExams] = useState<Exam[]>([]);

    const [formData, setFormData] = useState({
        title: '', description: '', thumbnail_url: '', instructor_name: '', category: '', level: 'beginner', duration_hours: 0, price: 0, is_published: false,
    });

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses');
            setCourses(data);
            // Fetch all exams for these courses
            const exams: Exam[] = [];
            for (const c of data) {
                try {
                    const { data: courseExams } = await API.get(`/exams/course/${c._id}`);
                    exams.push(...courseExams);
                } catch {}
            }
            setAllExams(exams);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await API.put(`/courses/${editingCourse._id}`, formData);
                toast.success('Course updated!');
            } else {
                await API.post('/courses', formData);
                toast.success('Course created!');
            }
            setIsDialogOpen(false); resetForm(); fetchCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save course');
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({ title: course.title, description: course.description, thumbnail_url: course.thumbnail_url, instructor_name: course.instructor_name, category: course.category, level: course.level, duration_hours: course.duration_hours, price: course.price, is_published: course.is_published });
        setIsDialogOpen(true);
    };

    const handleDelete = async (courseId: string) => {
        if (!confirm('Delete this course?')) return;
        try {
            await API.delete(`/courses/${courseId}`);
            toast.success('Course deleted!'); fetchCourses();
        } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to delete'); }
    };

    const togglePublish = async (course: Course) => {
        try {
            await API.put(`/courses/${course._id}`, { is_published: !course.is_published });
            toast.success(`Course ${!course.is_published ? 'published' : 'unpublished'}!`); fetchCourses();
        } catch (error: any) { toast.error(error.response?.data?.message || 'Failed'); }
    };

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post('/videos', videoForm);
            toast.success('Video added!');
            setVideoDialogOpen(false);
            setVideoForm({ course: '', title: '', description: '', url: '', duration_minutes: 0, order_index: 0 });
        } catch (error: any) { toast.error(error.response?.data?.message || 'Failed'); }
    };

    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post('/exams', examForm);
            toast.success('Exam created!');
            setExamDialogOpen(false);
            setExamForm({ course: '', title: '', description: '', time_limit_minutes: 15, is_published: false, questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
            fetchCourses();
        } catch (error: any) { toast.error(error.response?.data?.message || 'Failed'); }
    };

    const addQuestion = () => {
        setExamForm(prev => ({ ...prev, questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }] }));
    };

    const updateQuestion = (idx: number, field: string, value: any) => {
        const questions = [...examForm.questions];
        (questions[idx] as any)[field] = value;
        setExamForm(prev => ({ ...prev, questions }));
    };

    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        const questions = [...examForm.questions];
        questions[qIdx].options[oIdx] = value;
        setExamForm(prev => ({ ...prev, questions }));
    };

    const removeQuestion = (idx: number) => {
        if (examForm.questions.length <= 1) return;
        setExamForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
    };

    const fetchExamResults = async (examId: string) => {
        try {
            const { data } = await API.get(`/results/exam/${examId}`);
            setExamResults(data);
            setSelectedExamId(examId);
        } catch { toast.error('Failed to load results'); }
    };

    const resetForm = () => {
        setEditingCourse(null);
        setFormData({ title: '', description: '', thumbnail_url: '', instructor_name: '', category: '', level: 'beginner', duration_hours: 0, price: 0, is_published: false });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>;

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 font-serif">Instructor Dashboard</h1>
                <p className="text-slate-600 mt-2">Manage your courses, videos, exams, and track performance.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-lg">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="courses">My Courses</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="exams">Exams</TabsTrigger>
                    <TabsTrigger value="performance">Student Performance</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-4 rounded-full bg-blue-100 text-blue-600"><Users className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Total Courses</p><h3 className="text-2xl font-bold text-slate-900">{courses.length}</h3></div></CardContent></Card>
                        <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-4 rounded-full bg-emerald-100 text-emerald-600"><BookOpen className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Published</p><h3 className="text-2xl font-bold text-slate-900">{courses.filter(c => c.is_published).length}</h3></div></CardContent></Card>
                        <Card><CardContent className="p-6 flex items-center gap-4"><div className="p-4 rounded-full bg-violet-100 text-violet-600"><FileText className="h-6 w-6" /></div><div><p className="text-sm font-medium text-slate-500">Total Exams</p><h3 className="text-2xl font-bold text-slate-900">{allExams.length}</h3></div></CardContent></Card>
                    </div>
                </TabsContent>

                {/* COURSES TAB */}
                <TabsContent value="courses">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Course Library</h2>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => resetForm()} className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> Create Course</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle></DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2"><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                                    <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required /></div>
                                    <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="https://images.pexels.com/..." required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Instructor Name</Label><Input value={formData.instructor_name} onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label>Level</Label>
                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                                                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2"><Label>Duration (hours)</Label><Input type="number" value={formData.duration_hours} onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })} min="0" required /></div>
                                        <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} min="0" step="0.01" required /></div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="rounded" />
                                        <Label htmlFor="published">Publish immediately</Label>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800">{editingCourse ? 'Update Course' : 'Create Course'}</Button>
                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr><th className="px-6 py-4 font-semibold">Course Info</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold">Price</th><th className="px-6 py-4 font-semibold">Created</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y">
                                {courses.map((course) => (
                                    <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4"><div className="flex items-center gap-4"><img src={course.thumbnail_url} className="w-12 h-12 rounded object-cover" alt="" /><div><p className="font-medium text-slate-900">{course.title}</p><p className="text-slate-500 text-xs">{course.instructor_name}</p></div></div></td>
                                        <td className="px-6 py-4"><Badge variant={course.is_published ? 'default' : 'secondary'}>{course.is_published ? 'Published' : 'Draft'}</Badge></td>
                                        <td className="px-6 py-4 font-medium">${course.price}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(course.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(course)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => togglePublish(course)}>{course.is_published ? <><EyeOff className="h-4 w-4 mr-2" /> Unpublish</> : <><Eye className="h-4 w-4 mr-2" /> Publish</>}</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(course._id)} className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-500">No courses. Create one to get started.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                {/* VIDEOS TAB */}
                <TabsContent value="videos">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Video Manager</h2>
                        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> Add Video</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Video to Course</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddVideo} className="space-y-4">
                                    <div className="space-y-2"><Label>Course</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={videoForm.course} onChange={(e) => setVideoForm({ ...videoForm, course: e.target.value })} required>
                                            <option value="">Select a course...</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2"><Label>Title</Label><Input value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} required /></div>
                                    <div className="space-y-2"><Label>Description</Label><Textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} rows={2} /></div>
                                    <div className="space-y-2"><Label>Video URL (YouTube embed or direct link)</Label><Input value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} placeholder="https://www.youtube.com/embed/..." required /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={videoForm.duration_minutes} onChange={(e) => setVideoForm({ ...videoForm, duration_minutes: parseInt(e.target.value) })} min="0" /></div>
                                        <div className="space-y-2"><Label>Order</Label><Input type="number" value={videoForm.order_index} onChange={(e) => setVideoForm({ ...videoForm, order_index: parseInt(e.target.value) })} min="0" /></div>
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">Add Video</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card><CardContent className="p-6"><p className="text-slate-500 text-center">Select a course from the Courses tab to manage its videos, or add a new video above.</p></CardContent></Card>
                </TabsContent>

                {/* EXAMS TAB */}
                <TabsContent value="exams">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Exam Manager</h2>
                        <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-slate-900 text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> Create Exam</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Create New Exam</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddExam} className="space-y-4">
                                    <div className="space-y-2"><Label>Course</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={examForm.course} onChange={(e) => setExamForm({ ...examForm, course: e.target.value })} required>
                                            <option value="">Select a course...</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Title</Label><Input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} required /></div>
                                        <div className="space-y-2"><Label>Time Limit (min)</Label><Input type="number" value={examForm.time_limit_minutes} onChange={(e) => setExamForm({ ...examForm, time_limit_minutes: parseInt(e.target.value) })} min="1" required /></div>
                                    </div>
                                    <div className="space-y-2"><Label>Description</Label><Textarea value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} rows={2} /></div>
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" checked={examForm.is_published} onChange={(e) => setExamForm({ ...examForm, is_published: e.target.checked })} className="rounded" />
                                        <Label>Publish immediately</Label>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-slate-900">Questions ({examForm.questions.length})</h3>
                                            <Button type="button" variant="outline" size="sm" onClick={addQuestion}><Plus className="h-3 w-3 mr-1" /> Add Question</Button>
                                        </div>
                                        {examForm.questions.map((q, qIdx) => (
                                            <Card key={qIdx} className="mb-4">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-bold">Question {qIdx + 1}</Label>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIdx)} className="text-red-500 h-6"><Trash2 className="h-3 w-3" /></Button>
                                                    </div>
                                                    <Input value={q.question} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Enter question..." required />
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className="flex items-center gap-2">
                                                            <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer === oIdx} onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)} />
                                                            <Input value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`} className="flex-1" required />
                                                        </div>
                                                    ))}
                                                    <p className="text-xs text-slate-400">Select the radio button next to the correct answer.</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">Create Exam</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {allExams.length > 0 ? (
                        <div className="space-y-3">
                            {allExams.map((exam) => (
                                <Card key={exam._id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{exam.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span><Clock className="w-3 h-3 inline mr-1" />{exam.time_limit_minutes} min</span>
                                                <span><FileText className="w-3 h-3 inline mr-1" />{exam.questions?.length || 0} questions</span>
                                                <Badge variant={exam.is_published ? 'default' : 'secondary'} className="text-xs">{exam.is_published ? 'Published' : 'Draft'}</Badge>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => fetchExamResults(exam._id)}>View Results</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card><CardContent className="p-12 text-center text-slate-500">No exams created yet.</CardContent></Card>
                    )}
                </TabsContent>

                {/* PERFORMANCE TAB */}
                <TabsContent value="performance">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Student Performance</h2>
                    {allExams.length > 0 && (
                        <div className="mb-6">
                            <Label>Select an Exam</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2" value={selectedExamId} onChange={(e) => fetchExamResults(e.target.value)}>
                                <option value="">Choose an exam...</option>
                                {allExams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                            </select>
                        </div>
                    )}

                    {examResults.length > 0 ? (
                        <div className="bg-white border rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr><th className="px-6 py-3 font-semibold">Student</th><th className="px-6 py-3 font-semibold">Email</th><th className="px-6 py-3 font-semibold">Score</th><th className="px-6 py-3 font-semibold">Percentage</th><th className="px-6 py-3 font-semibold">Date</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {examResults.map((r: any) => (
                                        <tr key={r._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium">{r.user?.name}</td>
                                            <td className="px-6 py-3 text-slate-500">{r.user?.email}</td>
                                            <td className="px-6 py-3">{r.score}/{r.total_questions}</td>
                                            <td className="px-6 py-3">
                                                <span className={`font-bold ${r.percentage >= 70 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{r.percentage}%</span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Card><CardContent className="p-12 text-center text-slate-500">{selectedExamId ? 'No submissions yet.' : 'Select an exam to view student results.'}</CardContent></Card>
                    )}
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
