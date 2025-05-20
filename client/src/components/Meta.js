import React from 'react';
import { Helmet } from 'react-helmet';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'BabyBon - Đồ chơi giáo dục cho bé',
  description:
    'Đồ chơi giáo dục chất lượng cao, làm thủ công tại Việt Nam. Bảng bận rộn, đồ chơi Montessori và quà tặng cá nhân hóa.',
  keywords:
    'đồ chơi trẻ em, đồ chơi giáo dục, montessori, bảng bận rộn, quà tặng cho bé, đồ chơi gỗ, đồ chơi an toàn',
};

export default Meta; 