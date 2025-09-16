type ResultInfoBase = { error?: any }
export function formatResultList<T extends ResultInfoBase>(list: T[]) {
  return list.reduce((acc, item) => {
    if (item.error) acc.errorList.push(item)
    else acc.successList.push(item)
    return acc
  }, { successList: [] as Omit<T, 'error'>[], errorList: [] as T[] })
}
