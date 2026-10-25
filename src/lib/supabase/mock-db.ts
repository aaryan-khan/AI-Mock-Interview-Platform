import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_FILE = path.join(process.cwd(), ".mock-db.json");

export interface MockDb {
  student_interviews: any[];
  student_questions: any[];
  student_sessions: any[];
  student_answers: any[];
}

export function loadDb(): MockDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading mock db:", e);
  }
  return {
    student_interviews: [],
    student_questions: [],
    student_sessions: [],
    student_answers: [],
  };
}

export function saveDb(data: MockDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing mock db:", e);
  }
}

export class MockQueryBuilder {
  private tableName: keyof MockDb;
  private filters: ((row: any) => boolean)[] = [];
  private orderField?: string;
  private ascending = true;
  private limitCount?: number;
  private selectCols?: string;
  private isInsert = false;
  private isUpdate = false;
  private insertData: any = null;
  private updateData: any = null;

  constructor(tableName: keyof MockDb) {
    this.tableName = tableName;
  }

  select(columns = "*", options?: any) {
    this.selectCols = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  not(column: string, _operator: string, value: any) {
    if (value === null) {
      this.filters.push((row) => row[column] !== null && row[column] !== undefined);
    } else {
      this.filters.push((row) => row[column] !== value);
    }
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((row) => {
      if (value === null) return row[column] === null || row[column] === undefined;
      return row[column] === value;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column;
    this.ascending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.updateData = data;
    return this;
  }

  private execute() {
    const db = loadDb();
    const rows = (db[this.tableName] || []) as any[];

    if (this.isInsert) {
      const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted: any[] = [];
      for (const item of items) {
        const newItem = {
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          ...item,
        };
        rows.push(newItem);
        inserted.push(newItem);
      }
      db[this.tableName] = rows;
      saveDb(db);
      const resData = Array.isArray(this.insertData) ? inserted : inserted[0];
      return {
        data: resData,
        error: null,
      };
    }

    if (this.isUpdate) {
      for (let i = 0; i < rows.length; i++) {
        const match = this.filters.every((f) => f(rows[i]));
        if (match) {
          rows[i] = { ...rows[i], ...this.updateData };
        }
      }
      db[this.tableName] = rows;
      saveDb(db);
      return { data: rows, error: null };
    }

    // SELECT
    let result = rows.filter((row) => this.filters.every((f) => f(row)));

    if (this.orderField) {
      result.sort((a, b) => {
        const va = a[this.orderField!];
        const vb = b[this.orderField!];
        if (va == null && vb == null) return 0;
        if (va == null) return this.ascending ? -1 : 1;
        if (vb == null) return this.ascending ? 1 : -1;
        if (va < vb) return this.ascending ? -1 : 1;
        if (va > vb) return this.ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    // Handle joins like student_questions(question_text,question_number)
    if (this.tableName === "student_answers" && this.selectCols?.includes("student_questions")) {
      const questions = db.student_questions || [];
      result = result.map((ans) => {
        const q = questions.find((item) => item.id === ans.question_id);
        return {
          ...ans,
          student_questions: q
            ? {
                question_text: q.question_text,
                question_number: q.question_number,
              }
            : null,
        };
      });
    }

    const count = result.length;

    return {
      data: result,
      count,
      error: null,
    };
  }

  then(resolve: any, reject?: any) {
    const res = this.execute();
    return Promise.resolve(res).then(resolve, reject);
  }

  async single() {
    const res = this.execute();
    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
      return { data: null, error: { message: "Row not found" } };
    }
    const row = Array.isArray(res.data) ? res.data[0] : res.data;
    return { data: row, error: null };
  }

  async maybeSingle() {
    const res = this.execute();
    if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
      return { data: null, error: null };
    }
    const row = Array.isArray(res.data) ? res.data[0] : res.data;
    return { data: row, error: null };
  }
}
