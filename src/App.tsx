import { useState, useEffect } from "react";
import { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoSubject, setNewTodoSubject] = useState<
    "数学" | "英語" | "国語" | "理科" | "社会" | "その他"
  >("その他");
  const [newTodoNameError, setNewTodoNameError] = useState("");

  const [initialized, setInitialized] = useState(false);
  const localStorageKey = "TodoApp";

  useEffect(() => {
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr && todoJsonStr !== "[]") {
      const storedTodos: Todo[] = JSON.parse(todoJsonStr);
      const convertedTodos = storedTodos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
      setTodos(convertedTodos);
    } else {
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
    }
  }, [todos, initialized]);

  const [sortKey, setSortKey] = useState<
    "priority" | "deadline" | "name" | "subject" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (sortKey) {
      const sortedTodos = [...todos].sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        if (sortKey === "deadline") {
          aValue = aValue || new Date(8640000000000000); // 最大の日付
          bValue = bValue || new Date(8640000000000000);
        } else if (sortKey === "priority") {
          aValue = aValue ?? Infinity;
          bValue = bValue ?? Infinity;
        }

        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";

        if (aValue < bValue) {
          return sortOrder === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
          return sortOrder === "asc" ? 1 : -1;
        } else {
          return 0;
        }
      });

      setTodos(sortedTodos);
    }
  }, [sortKey, sortOrder, todos]);

  const uncompletedCount = todos.filter((todo: Todo) => !todo.isDone).length;

  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value));
    setNewTodoName(e.target.value);
  };

  const updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const updateNewTodoSubject = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewTodoSubject(
      e.target.value as "数学" | "英語" | "国語" | "理科" | "社会" | "その他"
    );
  };

  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isDone: value };
      } else {
        return todo;
      }
    });
    setTodos(updatedTodos);
  };

  const removeCompletedTodos = () => {
    const updatedTodos = todos.filter((todo) => !todo.isDone);
    setTodos(updatedTodos);
  };

  const remove = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const updateTodo = (updatedTodo: Todo) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    );
    setTodos(updatedTodos);
  };

  const addNewTodo = () => {
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }
    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
      subject: newTodoSubject,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
    setNewTodoSubject("その他");
  };

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>
      <div className="mb-4">
        <WelcomeMessage
          name="寝屋川タヌキ"
          uncompletedCount={uncompletedCount}
        />
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <label className="font-bold">ソート条件:</label>
        <select
          value={sortKey || ""}
          onChange={(e) =>
            setSortKey(
              e.target.value as
                | "priority"
                | "deadline"
                | "name"
                | "subject"
                | null
            )
          }
          className="rounded-md border px-2 py-1"
        >
          <option value="">なし</option>
          <option value="priority">優先度</option>
          <option value="deadline">期限</option>
          <option value="name">名前</option>
          <option value="subject">教科</option>
        </select>

        <label className="font-bold">並び順:</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="rounded-md border px-2 py-1"
        >
          <option value="asc">昇順</option>
          <option value="desc">降順</option>
        </select>
      </div>
      <TodoList
        todos={todos}
        updateIsDone={updateIsDone}
        remove={remove}
        updateTodo={updateTodo}
      />
      <button
        type="button"
        onClick={removeCompletedTodos}
        className={
          "mt-5 rounded-md bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
        }
      >
        完了済みのタスクを削除
      </button>

      <div className="mt-5 space-y-2 rounded-md border p-3">
        <h2 className="text-lg font-bold">新しいタスクの追加</h2>
        <div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="newTodoName">
              名前
            </label>
            <input
              id="newTodoName"
              type="text"
              value={newTodoName}
              onChange={updateNewTodoName}
              className={twMerge(
                "grow rounded-md border p-2",
                newTodoNameError && "border-red-500 outline-red-500"
              )}
              placeholder="2文字以上、32文字以内で入力してください"
            />
          </div>
          {newTodoNameError && (
            <div className="ml-10 flex items-center space-x-1 text-sm font-bold text-red-500 ">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newTodoNameError}</div>
            </div>
          )}
        </div>

        <div className="flex gap-5">
          <div className="font-bold">優先度</div>
          {[1, 2, 3].map((value) => (
            <label key={value} className="flex items-center space-x-1">
              <input
                id={`priority-${value}`}
                name="priorityGroup"
                type="radio"
                value={value}
                checked={newTodoPriority === value}
                onChange={updateNewTodoPriority}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-x-2">
          <label htmlFor="deadline" className="font-bold">
            期限
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={
              newTodoDeadline
                ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                : ""
            }
            onChange={updateDeadline}
            className="rounded-md border border-gray-400 px-2 py-0.5"
          />
        </div>

        <div className="flex items-center gap-x-2">
          <label htmlFor="subject" className="font-bold">
            教科
          </label>
          <select
            id="subject"
            value={newTodoSubject}
            onChange={updateNewTodoSubject}
            className="rounded-md border px-2 py-1"
          >
            <option value="数学">数学</option>
            <option value="英語">英語</option>
            <option value="国語">国語</option>
            <option value="理科">理科</option>
            <option value="社会">社会</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <button
          type="button"
          onClick={addNewTodo}
          className={twMerge(
            "rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600",
            newTodoNameError && "cursor-not-allowed opacity-50"
          )}
        >
          追加
        </button>
      </div>
    </div>
  );
};

export default App;
