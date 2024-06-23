function formatDateFromDatabase(dateString) {
    // Create a Date object from the date string
    const date = new Date(dateString);

    // Extract components
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Format the date as "hh:mm dd/mm/yyyy"
    return `${hours}:${minutes} ${day}/${month}/${year}`;
}

export default formatDateFromDatabase;
