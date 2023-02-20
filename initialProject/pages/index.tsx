import { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { apiPostRequest } from '../lib/request';
import styles from '../styles/Home.module.css';

type ListItem = { id: number; checked: boolean; name: string };
type ApiResponse = { status: 'ok'; list: ListItem[] };
type AddApiResponse = { status: 'ok'; id: number };

let updateTimerID: NodeJS.Timeout;

const Home: NextPage = () => {
  //
  // State
  //

  const [list, setList] = useState<ListItem[]>([]);
  const [editedValue, setEditedValue] = useState<string>('');
  const editedItemID = useRef<number | null>(null);
  const [state, setState] = useState<'initializing' | 'error' | 'ok'>(
    'initializing'
  );

  const resetTimer = () => {
    clearTimeout(updateTimerID);
    updateTimerID = setTimeout(fetchList, 5000);
  };

  const fetchList = async () => {
    if (!document.hidden) {
      const response = await apiPostRequest<ApiResponse>('/api/list', {});
      if (response.status == 'ok') {
        if (state != 'ok') setState('ok');
        setList(response.list);
      } else {
        console.log('Error getting list', response);
      }
    }
    clearTimeout(updateTimerID);
    updateTimerID = setTimeout(fetchList, document.hidden ? 500 : 1500);
  };

  useEffect(() => {
    // Prevent React18 devlopment double component mount
    clearTimeout(updateTimerID);
    updateTimerID = setTimeout(fetchList, 10);
    return () => clearTimeout(updateTimerID);
  }, []);

  //
  // Handlers
  //

  const onChangeName = async (item: ListItem, value: string) => {
    setEditedValue(value);
    resetTimer();
    await apiPostRequest<ApiResponse>('/api/update', { ...item, name: value });
  };

  const onDelete = async (item: ListItem) => {
    resetTimer();
    const newList = [...list];
    newList.splice(
      list.findIndex((i) => i.id == item.id),
      1
    );
    setList(newList);
    await apiPostRequest<ApiResponse>('/api/delete', { id: item.id });
  };

  const onToggle = async (item: ListItem) => {
    resetTimer();
    const newList = [...list];
    const changedItem = newList.find((l) => l.id == item.id)!;
    changedItem.checked = !changedItem.checked;
    setList(newList);
    await apiPostRequest<ApiResponse>('/api/update', changedItem);
  };

  const onAdd = async () => {
    resetTimer();
    const tmpID = list.reduce((prev, curr) => (prev = Math.min(prev, curr.id)), 0) - 1;
    setList([...list, { id: tmpID, name: '', checked: false }]);
    const ret = (await apiPostRequest<AddApiResponse>('/api/add', {})) as AddApiResponse;
    setList((list) => {
      const item = list.find((l) => l.id == tmpID);
      if (item) item.id = ret.id;
      return [...list];
    });
    let count = 0;
    let e = null;
    while (!e && count++ < 10) {
      e = document.getElementById('item' + ret.id);
      await new Promise((r) => setTimeout(r, 10));
    }
    if (e) e.focus();
  };

  //
  // Render
  //

  return (
    <>
      <Head>
        <title>Diploi Next.js To-Do App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>What To Do?</h1>

        {state == 'initializing' && <div style={{ padding: 50 }}>Loading…</div>}
        {state == 'ok' && (
          <>
            <ol className={styles.list}>
              {list.map((l, i) => (
                <li key={l.id}>
                  <input
                    type="checkbox"
                    onChange={() => onToggle(l)}
                    checked={l.checked}
                  />
                  <input
                    type="text"
                    placeholder="…"
                    id={'item' + l.id}
                    onFocus={() => {
                      editedItemID.current = l.id;
                      setEditedValue(l.name);
                    }}
                    onBlur={() => {
                      editedItemID.current = null;
                      const newList = [...list];
                      newList.find((l2) => l2.id == l.id)!.name = editedValue;
                      setList(newList);
                    }}
                    onChange={(e) => onChangeName(l, e.target.value)}
                    value={editedItemID.current == l.id ? editedValue : l.name}
                  />
                  <button onClick={() => onDelete(l)}>×</button>
                </li>
              ))}
            </ol>
            <button className={styles.add} onClick={onAdd}>
              Add Item
            </button>
          </>
        )}

        <footer className={styles.footer}>
          <p>
            You are looking at a <a href="#">Next.js To-Do example</a> for{' '}
            <a href="https://diploi.dev">Diploi</a>,<br />
            the easy-to-use app development platform.
          </p>
        </footer>
      </main>
    </>
  );
};

export default Home;
