import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import useMarvelService from '../../services/MarvelService';
import setContentList from '../../utils/setContentList';

import './charList.scss';

const CharList = (props) => {
	const [chars, setChars] = useState([]);
	const [newItemLoading, setNewItemLoading] = useState(false);
	const [offset, setOffset] = useState(210);
	const [charEnded, setCharEnded] = useState(false);

	const { getAllCharacters, clearError, process, setProcess } =
		useMarvelService();

	useEffect(() => {
		onRequest(true);
	}, []);

	const onRequest = (initial) => {
		clearError();
		initial ? setNewItemLoading(false) : setNewItemLoading(true);
		getAllCharacters(offset)
			.then(onCharListLoaded)
			.then(() => setProcess('success'));
	};

	const onCharListLoaded = (newChars) => {
		const ended = newChars.length < 9;
		setChars((charList) => [...charList, ...newChars]);
		setNewItemLoading(false);
		setOffset((offset) => offset + newChars.length);
		setCharEnded(ended);
	};

	const itemRefs = useRef([]);

	const focusOnItem = (id) => {
		itemRefs.current.forEach((item) =>
			item.classList.remove('char__item_selected')
		);
		itemRefs.current[id].classList.add('char__item_selected');
		itemRefs.current[id].focus();
	};

	const renderList = () => {
		const items = chars.map((char, i) => {
			const { name, thumbnail } = char;
			const imgStyle = thumbnail.includes('image_not_available')
				? { objectFit: 'contain' }
				: { objectFit: 'cover' };
			return (
				<li
					key={char.id}
					className="char__item"
					tabIndex={0}
					ref={(el) => (itemRefs.current[i] = el)}
					onClick={() => {
						props.onCharSelected(char.id);
						focusOnItem(i);
					}}
					onKeyPress={(e) => {
						if (e.key === ' ' || e.key === 'Enter') {
							props.onCharSelected(char.id);
							focusOnItem(i);
						}
					}}>
					<img src={thumbnail} alt="thumbnail" style={imgStyle} />
					<div className="char__name">{name}</div>
				</li>
			);
		});
		return <ul className="char__grid">{items}</ul>;
	};
	const content = useMemo(
		() => setContentList(process, () => renderList(), newItemLoading),
		[process]
	);
	return (
		<div className="char__list">
			{content}
			<button
				className="button button__main button__long"
				disabled={newItemLoading}
				style={{ display: charEnded ? 'none' : 'block' }}
				onClick={() => onRequest(false)}>
				<div className="inner">load more</div>
			</button>
		</div>
	);
};

CharList.propTypes = {
	onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
