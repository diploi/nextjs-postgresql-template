import type { NextPage } from 'next';
import Head from 'next/head';
import useSWR from 'swr';
import type { ListResponse } from './api/list';
import { ListItem, Item } from '../components/ListItem';

import styles from '../styles/Home.module.css';

/** Get data from API (used as a fetcher for SWR) */
const get = (...args: Parameters<typeof fetch>) => fetch(...args).then(res => res.json());

/** Send data to the API via a POST request */
const post = (url: string, data: any) => fetch(url, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

const Home: NextPage = () => {
  const { data, mutate, isLoading, isValidating } = useSWR<ListResponse>('/api/list', get);
  const { data: subtitle } = useSWR<string>('/api/subtitle', get);

  const handleItemAdd = async () => {
    // Tell API to add a new line
    await post('/api/add', {});

    // Tell SWR to refetch list from API
    mutate(data);
  }

  const handleItemChange = async (updated: Item) => {
    const list = [...(data?.list || [])];
    const item = list.find(item => item.id === updated.id);
    if (!item) return;

    item.name = updated.name;
    item.checked = updated.checked;

    // Tell API about this change
    await post('/api/update', updated);

    // Update the local state right away & tell SWR to refetch list from API
    mutate({ list });
  };

  const handleItemDelete = async (deleted: Item) => {
    const list = (data?.list || []).filter(item => item.id !== deleted.id)

    // Tell API about this change
    await post('/api/delete', deleted);

    // Update the local state right away & tell SWR to refetch list from API
    mutate({ list });
  };

  return (
    <>
      <Head>
        <title>Diploi Next.js To-Do App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          What To Do?
          <small>{subtitle || '...'}</small>
        </h1>

        {isLoading && <div style={{ padding: 50 }}>Loading…</div>}
        {!isLoading && (
          <>
            <ol className={styles.list}>
              {(data?.list || []).map((item) => (
                <ListItem key={item.id} {...item} onChange={handleItemChange} onDelete={handleItemDelete} />
              ))}
            </ol>
            <button className={styles.add} disabled={isLoading || isValidating} onClick={handleItemAdd}>
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
