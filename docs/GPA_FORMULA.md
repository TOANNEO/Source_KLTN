# GPA_FORMULA.md — Công thức tính GPA Trường Đại học Thăng Long

## 1. Điểm học phần (thang 10)

```
Điểm tổng kết = 0.3 × Điểm giữa kỳ + 0.7 × Điểm cuối kỳ
```

**Ký hiệu:**
- GK = Điểm giữa kỳ (0-10)  middle_exam_score
- CK = Điểm cuối kỳ (0-10)
- `total = 0.3*GK + 0.7*CK`

---

## 2. GPA tích lũy (thang 10)

```
GPA tích lũy = Σ(điểm_tổng_kết_i × số_tín_chỉ_i) / Σ(số_tín_chỉ_i)
```

**JavaScript implementation:**
```javascript
function calculateCumulativeGPA(grades) {
  // grades: [{ total_score, credits }, ...]
  const totalWeighted = grades.reduce((sum, g) => sum + g.total_score * g.credits, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
  return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}
```

---

## 3. Điều kiện học cải thiện

Sinh viên được phép học cải thiện môn có điểm tổng kết trong khoảng:
```
4.0 ≤ điểm_tổng_kết ≤ 5.6
```

Khi học cải thiện: 

Trường hợp 1 (Điểm cao hơn): Xóa bản ghi điểm cũ (hoặc đánh dấu ẩn) và lưu bản ghi mới vào bảng điểm tích lũy.

Trường hợp 2 (Điểm thấp hơn/bằng): Giữ nguyên bản ghi cũ, bản ghi mới chỉ được tính là điểm thi/học lại nhưng không tham gia vào công thức tính GPA tích lũy.

Số lần học: Cần làm rõ hệ thống có giới hạn số lần học cải thiện cho một môn hay không

---

## 4. Goal Seek — Tính điểm cần đạt

Bài toán: Biết GPA mục tiêu, tính điểm cuối kỳ tối thiểu cần đạt.

```javascript
function goalSeek(targetGPA, currentGrades, coursesToImprove) {
  // currentGrades: tất cả môn đã có điểm (không tính môn đang tính)
  // coursesToImprove: [{ course_id, credits, current_total }, ...]
  
  const baseWeighted = currentGrades.reduce((s, g) => s + g.total_score * g.credits, 0);
  const baseCredits = currentGrades.reduce((s, g) => s + g.credits, 0);
  
  const results = [];
  
  for (const course of coursesToImprove) {
    // Giả sử  GK đã biết, tính CK cần đạt
    // total = targetScore (cần tính)
    // targetGPA = (baseWeighted - course.current_total * course.credits + targetScore * course.credits)
    //             / (baseCredits)
    
    const neededWeighted = targetGPA * baseCredits;
    const targetScore = (neededWeighted - (baseWeighted - course.current_total * course.credits))
                        / course.credits;
    
    results.push({
      course_id: course.course_id,
      needed_total_score: Math.round(targetScore * 100) / 100,
      is_achievable: targetScore <= 10.0,
      is_realistic: targetScore <= 9.0
    });
  }
  
  return results;
}
```

```javascript
 function calculateExtraCreditsNeeded(targetGPA, currentGPA, totalCredits, expectedNewGrade = 8.5) {
  // Tính số điểm tích lũy còn thiếu sau khi đã giả lập cải thiện tối đa các môn cũ
  const pointsMissing = (targetGPA - currentGPA) * totalCredits;
  
  // Tính số tín chỉ mới cần đăng ký (giả sử đạt mức điểm expectedNewGrade)
  // Formula: extraCredits = pointsMissing / (expectedNewGrade - targetGPA)
  if (expectedNewGrade <= targetGPA) return Infinity; // Mục tiêu không tưởng
  
  return Math.ceil(pointsMissing / (expectedNewGrade - targetGPA));
}
---

## 5. Tính mức tăng GPA khi học cải thiện

```javascript
function calculateGpaGain(currentGrades, courseToImprove, newScore) {
  // Giả sử đạt điểm mới (newScore thay cho điểm cũ)
  const totalCredits = currentGrades.reduce((s, g) => s + g.credits, 0);
  const oldWeighted = currentGrades.reduce((s, g) => s + g.total_score * g.credits, 0);
  
  // Thay điểm môn học cải thiện
  const improvement = (newScore - courseToImprove.current_total) * courseToImprove.credits;
  const newGpa = (oldWeighted + improvement) / totalCredits;
  const oldGpa = oldWeighted / totalCredits;
  
  return Math.round((newGpa - oldGpa) * 1000) / 1000;
}
tiêu chí "Độ khó/Nỗ lực"
Ưu tiên 1: Môn có số tín chỉ lớn và $d_{old}$ thấp nhất (vì giúp tăng GPA nhanh nhất)
.Ưu tiên 2: Môn có điểm thành phần (Giữa kỳ) cao sẵn, sinh viên chỉ cần tập trung thi cuối kỳ để kéo tổng điểm lên.
// Sắp xếp giảm dần theo gain → đề xuất môn ưu tiên nhất
```

---

## 6. Phân loại học lực (tham khảo)

| Thang 10 | Thang 4 | Xếp loại |
|----------|---------|----------|
| 8.5 - 10 | 4.0 | Xuất sắc |
| 7.0 - 8.4 | 3.0 - 3.9 | Giỏi |
| 6.0 - 6.9 | 2.5 - 2.9 | Khá |
| 5.0 - 5.9 | 2.0 - 2.4 | Trung bình |
| < 5.0 | < 2.0 | Yếu/Kém |
## Mục 7: Xử lý ngoại lệ:
 Nếu sinh viên đặt mục tiêu quá cao mà việc học cải thiện không thể đáp ứng được (kể cả khi tất cả các môn cải thiện đều đạt 10.0), hệ thống cần đưa ra con số cụ thể về số tín chỉ mới cần nạp vào.
```javascript
 function suggestExtraCredits(targetGPA, maxGpaAfterImprovement, totalCredits) {
  const expectedGradeForNewCourses = 8.5; // Giả định sinh viên đạt mức điểm này cho các môn mới
  
  if (targetGPA >= expectedGradeForNewCourses) {
    return "Mục tiêu quá cao so với năng lực học tập dự kiến (8.5).";
  }

  const pointsMissing = (targetGPA - maxGpaAfterImprovement) * totalCredits;
  const extraCredits = Math.ceil(pointsMissing / (expectedGradeForNewCourses - targetGPA));
  
  return `Bạn cần học thêm ít nhất ${extraCredits} tín chỉ mới với điểm trung bình ${expectedGradeForNewCourses}.`;
}
```

## Mục 8: Quy trình cập nhật Database: Mô tả cách hệ thống ghi đè điểm cũ khi có điểm cải thiện mới.
Nguyên tắc tối ưu: Điểm mới chỉ được cập nhật vào GPA tích lũy nếu new_total > old_total.

Ghi đè (Override): Khi điểm mới cao hơn, hệ thống sẽ thay thế giá trị old_total bằng new_total trong các phép tính tích lũy, nhưng nên giữ lại lịch sử điểm cũ để đối chiếu.

Trường hợp điểm thấp hơn: Nếu học cải thiện nhưng điểm thấp hơn điểm cũ, hệ thống giữ nguyên điểm cũ để đảm bảo quyền lợi cho sinh viên.

## Mục 9: Tiêu chí ưu tiên gợi ý (Heuristic Sorting)
Ngoài việc sắp xếp theo gpa_gain (mức tăng điểm), bạn có thể bổ sung tiêu chí "Môn học dễ kéo điểm nhất":
- Ưu tiên 1: Môn có số tín chỉ ($a_i$) lớn và điểm cũ ($d_{old}$) thấp nhất (Vì gpa_gain sẽ cao nhất).
- Ưu tiên 2: Môn có điểm thành phần (Giữa kỳ) đã cao sẵn, chỉ cần cải thiện điểm Cuối kỳ là có thể nâng tổng điểm lên nhanh chóng.
