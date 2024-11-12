//ví dụ sử dụng bên dưới
function normalizeVietnamese(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
//function tìm mức độ trùng của tên
function similarity(s1, s2) {
  const normalize1 = normalizeVietnamese(s1);
  const normalize2 = normalizeVietnamese(s2);

  // Check if one string contains the other
  if (normalize1.includes(normalize2) || normalize2.includes(normalize1)) {
    return true;
  }

  // Split into words and check for matching parts
  const words1 = normalize1.split(" ");
  const words2 = normalize2.split(" ");

  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) matches++;
    }
  }

  // Return true if more than 50% of words match
  return matches >= Math.min(words1.length, words2.length) * 0.5;
}

// function tìm full tên khi có độ giống nhau
function findMatchingTeachers(inputName) {
    //fetch tên giáo viên sử dụng file data.json
  return fetch("data.json")
    .then((response) => response.json())
    .then((teachers) => {
      const matches = teachers.filter((teacher) =>
        similarity(teacher.name, inputName)
      );
      return matches;
    });
}
// ví dụ sử dụng
async function find(nameInput) {
    e.preventDefault();
    //lấy value của input
    const name = nameInput.value.trim();

    //trường hợp không điền tên
    if (!name) return;
    try {
        //tìm full tên
      const matches = await findMatchingTeachers(name);

      if (matches.length === 0) {
        //không tìm thấy
        showError(
          "No matching teacher found. Please check the spelling or try the full name."
        );
        return;
      }

      if (matches.length > 1) {
        // tìm thấy nhiều hơn 1 tên
        showDisambiguationDialog(matches, name);
        return;
      }

      //tên đã tìm thấy
      showTeacherMessage(matches[0]);
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred. Please try again.");
    } finally {
      showLoadingOverlay(false);
    }
  }
