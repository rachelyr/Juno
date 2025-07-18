// src/styles/dataGridStyles.ts (or wherever you keep these styles)

export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "& .MuiDataGrid-root": {
      backgroundColor: isDarkMode ? "#101214" : "white", 
      color: isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.87)",
      borderColor: isDarkMode ? "#424242" : "#e0e0e0", 
    },

    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      "& [role='row'] > *": {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`, // Headers background
        borderColor: `${isDarkMode ? "#424242" : ""}`,
      },
    },
    "& .MuiIconButton-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
     "& .MuiTablePagination-root": {
      backgroundColor: isDarkMode ? "#1d1f21" : "white", 
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },  
    "& .MuiTablePagination-selectIcon": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiDataGrid-cell": {
      backgroundColor: isDarkMode ? "#101214" : "white",
      color: isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.87)"
    },
    "& .MuiDataGrid-row": {
      backgroundColor: isDarkMode ? "#101214" : "white",
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "#e5e7eb"}`,
      "&:hover": {
        backgroundColor: isDarkMode ? "#1a1c1e" : "#f5f5f5",
      },
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: `${isDarkMode ? "#424242" : "#e5e7eb"}`, 
    },
    "& .MuiDataGrid-virtualScroller": {
        backgroundColor: isDarkMode ? "#101214" : "white",
    },
    "& .MuiDataGrid-overlay": { // For loading/no rows overlay
      backgroundColor: isDarkMode ? "#101214" : "white",
      color: isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.87)",
    },
     "& .MuiDataGrid-footerContainer": {
      backgroundColor: isDarkMode ? "#1d1f21" : "white",
      color: isDarkMode ? "#a3a3a3" : "rgba(0, 0, 0, 0.87)", // Text color for the footer
      borderColor: isDarkMode ? "#2d3135" : "#e0e0e0", // Border color for the footer
    }
  };
};