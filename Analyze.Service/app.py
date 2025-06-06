from flask import Flask, request, jsonify
from flask_cors import CORS
import statistics

app = Flask(__name__)
# Enable CORS for all routes, allowing all origins for development.
# In production, specify allowed origins: CORS(app, origins=["http://localhost:5173"])
CORS(app)

@app.route('/analyze/suggest', methods=['POST'])
def analyze_runs():
    data = request.json
    if not data or 'runs' not in data:
        return jsonify({"message": "Invalid input. 'runs' array is required."}), 400

    runs = data['runs']
    if not runs:
        return jsonify({"suggestions": ["Hãy thêm vài buổi chạy để nhận được phân tích!"]}), 200

    distances = [r['distanceKm'] for r in runs if 'distanceKm' in r]
    durations_sec = [r['durationSeconds'] for r in runs if 'durationSeconds' in r]

    suggestions = []

    if distances:
        avg_distance = statistics.mean(distances)
        max_distance = max(distances)
        total_distance = sum(distances)
        suggestions.append(f"Quãng đường chạy trung bình của bạn là {avg_distance:.2f} km.")
        suggestions.append(f"Tổng quãng đường đã chạy là {total_distance:.2f} km.")
        suggestions.append(f"Buổi chạy dài nhất của bạn là {max_distance:.2f} km.")

    if durations_sec:
        avg_duration_sec = statistics.mean(durations_sec)
        avg_duration_min = avg_duration_sec / 60
        suggestions.append(f"Thời gian chạy trung bình của bạn là {avg_duration_min:.1f} phút.")

        # Calculate pace (min/km)
        paces = []
        for r in runs:
            if 'distanceKm' in r and r['distanceKm'] > 0 and 'durationSeconds' in r:
                # Ensure duration is not zero to avoid division by zero
                if r['durationSeconds'] > 0:
                    pace = (r['durationSeconds'] / 60) / r['distanceKm'] # minutes per km
                    paces.append(pace)
        if paces:
            avg_pace = statistics.mean(paces)
            suggestions.append(f"Tốc độ trung bình của bạn là {avg_pace:.2f} phút/km.")
            suggestions.append(f"Tốc độ nhanh nhất bạn đạt được là {min(paces):.2f} phút/km.")
            suggestions.append(f"Tốc độ chậm nhất của bạn là {max(paces):.2f} phút/km.")


    # Basic suggestions based on performance and common running advice
    if len(runs) >= 3:
        if distances and avg_distance < 5:
            suggestions.append("Để cải thiện sức bền, bạn có thể thử tăng quãng đường chạy lên 5km.")
        if durations_sec and avg_duration_min < 30:
            suggestions.append("Cố gắng duy trì buổi chạy ít nhất 30 phút để tăng cường lợi ích tim mạch.")
        if paces:
            min_pace = min(paces)
            if min_pace < 5:
                suggestions.append("Bạn có tốc độ rất tốt! Hãy thử tập luyện interval để cải thiện tốc độ và sức bền.")
            elif min_pace > 7:
                suggestions.append("Để cải thiện tốc độ, cân nhắc các bài tập chạy ngắn và nhanh hơn hoặc các bài tập tăng cường sức mạnh chân.")

    if not suggestions:
        suggestions.append("Chưa có đủ dữ liệu để phân tích chi tiết. Hãy thêm vài buổi chạy nữa!")

    return jsonify({"suggestions": suggestions}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)