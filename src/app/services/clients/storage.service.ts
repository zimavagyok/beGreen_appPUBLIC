export class StorageService
{
  constructor()
  {}

  write(key: string, value: any)
  {
    if (value)
    {
        const data = JSON.stringify(value);
        localStorage.setItem(key, data);
    }
  }

  read<T>(key: string): T | undefined
  {
      const data: any = localStorage.getItem(key);

      if (data && data !== "undefined" && data !== "null")
      {
          return <T>JSON.parse(data);
      }

      return undefined;
  }

  remove(key: string) : void
  {
    localStorage.removeItem(key);
  }

  clearStorage() : void
  {
    localStorage.clear();
  }
}