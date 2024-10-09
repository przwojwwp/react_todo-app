import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Todo } from '../../types/Todo';
import { Filter } from '../../types/Filter';

type TodoContextProps = {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodoStatus: (id: number) => void;
  toggleMultipleTodosStatus: () => void;
  updateTodoTitle: (id: number, title: string) => void;
  deleteTodo: (id: number) => void;
  headerInputRef: React.RefObject<HTMLInputElement>;
  filter: Filter;
  setFilter: (filter: Filter) => void;
  deleteMultipleTodos: () => void;
  filteredTodos: Todo[];
};

const TodoContext = createContext<TodoContextProps | undefined>(undefined);

export const useTodoContext = () => {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }

  return context;
};

type TodoProviderProps = React.PropsWithChildren<{}>;

export const TodoProvider = ({ children }: TodoProviderProps) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const storedTodos = localStorage.getItem('todos');

    return storedTodos ? JSON.parse(storedTodos) : [];
  });

  const [filter, setFilter] = useState<Filter>('All');
  const headerInputRef = useRef<HTMLInputElement>(null);

  const areAllCompleted = useMemo(() => {
    return todos.every(todo => todo.completed);
  }, [todos]);

  const updatedTodos = useMemo(() => {
    return todos.map(todo => {
      return { ...todo, completed: !areAllCompleted };
    });
  }, [areAllCompleted, todos]);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));

    setTimeout(() => {
      headerInputRef.current?.focus();
    }, 0);
  }, [todos]);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'Active') {
      return !todo.completed;
    }

    if (filter === 'Completed') {
      return todo.completed;
    }

    return true;
  });

  const addTodo = useCallback((title: string) => {
    const newTodo: Todo = {
      id: +new Date(),
      title: title.trim(),
      completed: false,
    };

    setTodos(prevTodos => [...prevTodos, newTodo]);
  }, []);

  const toggleTodoStatus = useCallback((id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }, []);

  const toggleMultipleTodosStatus = useCallback(() => {
    setTodos(updatedTodos);
  }, [updatedTodos]);

  const updateTodoTitle = useCallback((id: number, newTitle: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, title: newTitle.trim() } : todo,
      ),
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  const deleteMultipleTodos = useCallback(() => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  }, []);

  const value = useMemo(
    () => ({
      todos,
      addTodo,
      toggleTodoStatus,
      toggleMultipleTodosStatus,
      updateTodoTitle,
      deleteTodo,
      headerInputRef,
      filter,
      setFilter,
      filteredTodos,
      deleteMultipleTodos,
    }),
    [
      addTodo,
      deleteMultipleTodos,
      deleteTodo,
      filter,
      filteredTodos,
      todos,
      toggleMultipleTodosStatus,
      toggleTodoStatus,
      updateTodoTitle,
    ],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
