import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container, InputGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaUpload, FaImage, FaTrash } from 'react-icons/fa';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import ImageWithFallback from '../../components/ImageWithFallback';
import {
  fetchProductDetails,
  resetProductState,
  createProduct,
  updateProduct,
} from '../../slices/productSlice';
import { fetchCategories } from '../../slices/categorySlice';
import { formatPrice } from '../../utils/formatPrice';

const ProductFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [description, setDescription] = useState('');
  const [richDescription, setRichDescription] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [images, setImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');
  const [safetyInfo, setSafetyInfo] = useState('');
  const [educationalValue, setEducationalValue] = useState('');
  const [isPersonalizable, setIsPersonalizable] = useState(false);
  const [personalizationOptions, setPersonalizationOptions] = useState('');
  const [tags, setTags] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Error messages for validation
  const [formErrors, setFormErrors] = useState({});

  // Get product and categories state from Redux
  const { product, loading, error, createSuccess, updateSuccess } = useSelector(
    (state) => state.product
  );
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );

  // Load product data when editing
  useEffect(() => {
    dispatch(fetchCategories());

    if (isEdit) {
      if (!product || product.id !== parseInt(id)) {
        dispatch(fetchProductDetails(id));
      } else {
        // Fill form with product data
        setName(product.name || '');
        setSku(product.sku || '');
        setPrice(product.price || '');
        setSalePrice(product.salePrice || '');
        setOnSale(product.onSale || false);
        setDescription(product.description || '');
        setRichDescription(product.richDescription || '');
        setStock(product.stock || '');
        setCategoryId(product.categoryId || '');
        setIsFeatured(product.isFeatured || false);
        setIsActive(product.isActive !== false);
        setMinAge(product.minAge || '');
        setMaxAge(product.maxAge || '');
        setThumbnailPreview(product.thumbnail || '');
        setImagesPreviews(product.images || []);
        setWeight(product.weight || '');
        setDimensions(product.dimensions || '');
        setMaterials(product.materials || '');
        setSafetyInfo(product.safetyInfo || '');
        setEducationalValue(product.educationalValue || '');
        setIsPersonalizable(product.isPersonalizable || false);
        setPersonalizationOptions(
          product.personalizationOptions
            ? JSON.stringify(product.personalizationOptions, null, 2)
            : ''
        );
        setTags(Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '');
        setVideoUrl(product.videoUrl || '');
      }
    }
    
    // Redirect after successful create/update
    if (createSuccess || updateSuccess) {
      navigate('/admin/products');
    }
    
    // Reset state when component unmounts
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch, id, product, createSuccess, updateSuccess, navigate, isEdit]);
  
  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  
  // Handle product images change
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages([...images, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagesPreviews([...imagesPreviews, ...newPreviews]);
    }
  };
  
  // Remove image from preview
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagesPreviews];
    
    // Only remove from the images array if it's a new file
    // If it's an existing file (from server), we'll only hide it but 
    // we'll indicate to keep it on the server
    if (index < images.length) {
      newImages.splice(index, 1);
      setImages(newImages);
    }
    
    newPreviews.splice(index, 1);
    setImagesPreviews(newPreviews);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!name) errors.name = 'Vui lòng nhập tên sản phẩm';
    if (!price) errors.price = 'Vui lòng nhập giá sản phẩm';
    if (price && isNaN(price)) errors.price = 'Giá phải là số';
    if (salePrice && isNaN(salePrice)) errors.salePrice = 'Giá khuyến mãi phải là số';
    if (onSale && !salePrice) errors.salePrice = 'Vui lòng nhập giá khuyến mãi';
    if (salePrice && parseFloat(salePrice) >= parseFloat(price)) {
      errors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }
    if (!categoryId) errors.categoryId = 'Vui lòng chọn danh mục';
    if (stock && isNaN(stock)) errors.stock = 'Số lượng tồn kho phải là số';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('sku', sku);
    formData.append('price', price);
    if (salePrice) formData.append('salePrice', salePrice);
    formData.append('onSale', onSale);
    formData.append('description', description);
    formData.append('richDescription', richDescription);
    formData.append('stock', stock || 0);
    formData.append('categoryId', categoryId);
    formData.append('isFeatured', isFeatured);
    formData.append('isActive', isActive);
    formData.append('minAge', minAge || 0);
    if (maxAge) formData.append('maxAge', maxAge);
    formData.append('weight', weight);
    formData.append('dimensions', dimensions);
    formData.append('materials', materials);
    formData.append('safetyInfo', safetyInfo);
    formData.append('educationalValue', educationalValue);
    formData.append('isPersonalizable', isPersonalizable);
    formData.append('personalizationOptions', personalizationOptions);
    formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
    formData.append('videoUrl', videoUrl);
    
    // Append files
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    
    if (images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    // Keep existing images if we're in edit mode
    if (isEdit && imagesPreviews.length > images.length) {
      formData.append('keepExistingImages', 'true');
    }
    
    // Dispatch action based on create/edit mode
    if (isEdit) {
      dispatch(updateProduct({ id, productData: formData }));
    } else {
      dispatch(createProduct(formData));
    }
  };

  return (
    <Container>
      <Meta title={isEdit ? 'Chỉnh sửa sản phẩm - BabyBon Admin' : 'Thêm sản phẩm mới - BabyBon Admin'} />
      
      <Button 
        variant="light" 
        className="mb-3"
        onClick={() => navigate('/admin/products')}
      >
        <FaArrowLeft className="me-2" /> Quay lại danh sách
      </Button>
      
      <h1 className="mb-4">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
      
      {loading || categoriesLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header as="h5">Thông tin cơ bản</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập tên sản phẩm"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          isInvalid={!!formErrors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mã sản phẩm (SKU)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã sản phẩm"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mô tả ngắn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Mô tả ngắn gọn về sản phẩm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mô tả chi tiết</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={richDescription}
                      onChange={(event, editor) => {
                        setRichDescription(editor.getData());
                      }}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Hình ảnh và video</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh chính</Form.Label>
                    <div className="d-flex align-items-center">
                      {thumbnailPreview ? (
                        <div className="admin-img-container">
                          <ImageWithFallback
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="admin-thumbnail-preview"
                            fallbackSrc="https://placehold.co/100x100/e5e5e5/a0a0a0?text=No+Image"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="admin-img-delete-btn"
                            onClick={() => {
                              setThumbnail(null);
                              setThumbnailPreview('');
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="admin-upload-placeholder me-3"
                          onClick={() => document.getElementById('thumbnail-upload').click()}
                        >
                          <FaImage size={30} className="text-secondary" />
                        </div>
                      )}
                      <Button variant="outline-primary" onClick={() => document.getElementById('thumbnail-upload').click()}>
                        <FaUpload className="me-2" /> Tải lên
                      </Button>
                      <input
                        type="file"
                        id="thumbnail-upload"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Hình ảnh bổ sung</Form.Label>
                    <div className="d-flex flex-wrap mb-2">
                      {imagesPreviews.map((preview, index) => (
                        <div key={index} className="admin-img-container">
                          <ImageWithFallback
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="admin-thumbnail-preview"
                            fallbackSrc="https://placehold.co/100x100/e5e5e5/a0a0a0?text=No+Image"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="admin-img-delete-btn"
                            onClick={() => removeImage(index)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                      <div
                        className="admin-upload-placeholder"
                        onClick={() => document.getElementById('images-upload').click()}
                      >
                        <FaUpload size={30} className="text-secondary" />
                      </div>
                      <input
                        type="file"
                        id="images-upload"
                        onChange={handleImagesChange}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                    </div>
                    <small className="text-muted">Có thể tải lên nhiều hình ảnh. Nhấn vào dấu + để thêm hình.</small>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Link video (YouTube, Vimeo...)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập URL video (nếu có)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Thông tin giáo dục</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Giá trị giáo dục</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Mô tả giá trị giáo dục của sản phẩm"
                      value={educationalValue}
                      onChange={(e) => setEducationalValue(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Thông tin an toàn</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Thông tin về an toàn sản phẩm"
                      value={safetyInfo}
                      onChange={(e) => setSafetyInfo(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Vật liệu</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Vật liệu làm sản phẩm"
                      value={materials}
                      onChange={(e) => setMaterials(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header as="h5">Giá và tồn kho</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Giá <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder="Nhập giá"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        isInvalid={!!formErrors.price}
                      />
                      <InputGroup.Text>VNĐ</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.price}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="onSale"
                      label="Đang giảm giá"
                      checked={onSale}
                      onChange={(e) => setOnSale(e.target.checked)}
                    />
                  </Form.Group>
                  
                  {onSale && (
                    <Form.Group className="mb-3">
                      <Form.Label>Giá khuyến mãi</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          placeholder="Nhập giá khuyến mãi"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          isInvalid={!!formErrors.salePrice}
                        />
                        <InputGroup.Text>VNĐ</InputGroup.Text>
                        <Form.Control.Feedback type="invalid">
                          {formErrors.salePrice}
                        </Form.Control.Feedback>
                      </InputGroup>
                      {price && salePrice && (
                        <small className="text-success">
                          Giảm {Math.round((1 - salePrice / price) * 100)}%
                        </small>
                      )}
                    </Form.Group>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Số lượng tồn kho</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập số lượng tồn kho"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      isInvalid={!!formErrors.stock}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.stock}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Phân loại</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      isInvalid={!!formErrors.categoryId}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.categoryId}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Độ tuổi phù hợp (tháng)</Form.Label>
                    <Row>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Từ"
                          value={minAge}
                          onChange={(e) => setMinAge(e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Đến"
                          value={maxAge}
                          onChange={(e) => setMaxAge(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Form.Text className="text-muted">
                      Để trống "Đến" nếu không có giới hạn độ tuổi tối đa
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tags, phân cách bằng dấu phẩy"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Ví dụ: montessori, đồ chơi giáo dục, puzzle
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Thông tin bổ sung</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Kích thước</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 10x20x30 cm"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Trọng lượng (gram)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập trọng lượng"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="isPersonalizable"
                      label="Có thể cá nhân hóa"
                      checked={isPersonalizable}
                      onChange={(e) => setIsPersonalizable(e.target.checked)}
                    />
                  </Form.Group>
                  
                  {isPersonalizable && (
                    <Form.Group className="mb-3">
                      <Form.Label>Tùy chọn cá nhân hóa (JSON)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder='{"nameLabel": "Tên bé", "maxLength": 15}'
                        value={personalizationOptions}
                        onChange={(e) => setPersonalizationOptions(e.target.value)}
                      />
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Trạng thái</Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="isActive"
                      label="Đang hoạt động"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      Sản phẩm sẽ hiển thị trên website nếu được kích hoạt
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="isFeatured"
                      label="Sản phẩm nổi bật"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <div className="d-grid">
                <Button variant="primary" type="submit" size="lg">
                  <FaSave className="me-2" /> {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
};

export default ProductFormPage; 