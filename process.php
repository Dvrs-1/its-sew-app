<?php
header('Content-Type:application/json');




if ($_SERVER["REQUEST_METHOD"] === 'POST') {

$input = json_decode(file_get_contents('php://input'),true);

  // Collect raw values safely
  $name = htmlspecialchars( $input['name'] ?? '', ENT_QUOTES, 'UTF-8');
  $email = htmlspecialchars( $input['email'] ?? '', ENT_QUOTES, 'UTF-8');
  $phone = htmlspecialchars( $input['phone'] ?? '', ENT_QUOTES, 'UTF-8');
  $feedback = htmlspecialchars( $input['feedback'] ?? '', ENT_QUOTES, 'UTF-8');

  // Sanitize

  $response = [
  'status' => 'success',
  'data' => [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'feedback' => $feedback
  ]
];

echo json_encode($response);
}
?>
