export const formatDate = (date) => {
  const noteDate = new Date(date)
  const day = String(noteDate.getDate()).padStart(2, "0")
  const month = String(noteDate.getMonth() + 1).padStart(2, "0")
  const year = noteDate.getFullYear()

  let hours = noteDate.getHours()
  const minutes = String(noteDate.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12
  const formattedHours = String(hours).padStart(2, "0")

  return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`
}

export const getPreview = (content, maxLength = 50) => {
  return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
}
